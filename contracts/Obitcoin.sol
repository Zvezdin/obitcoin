pragma solidity ^0.4.9;

import "BonusPools";
import "MembersLib";

contract Obitcoin{
    using BonusPools for BonusPools.Pool;
    using MembersLib for MembersLib.Member;
    
    //events for all actions made by the contract. They are fired by the contract, then catched and processed by the web application
    //once an event is fired, it will always stay in the blockchain. This is the why our application can load all transactions that ever occurred within the contracy
    //the contract has no access to previously fired events. That's why firing events is always cheaper than saving the same amount of data in contract storage
	
	//event to notify that someone has tried to access a method that he shouldn't have
	event UnauthorizedAccess(uint16 indexed from, address indexed fromAddress, uint time);
	
	//event to notify the removal or addition of an admin
	event AdminChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
	//event to notify the removal or addition of a person
	event PersonChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
	event VoteChanged(uint16 indexed from, uint16 indexed voteIndex, uint16 pool, VoteState voteState, uint time);
	
	event Voted(uint16 indexed from, uint16 indexed voteIndex, uint16 pool, bool vote, uint time);
	
	event Delegation(uint16 indexed from, uint16 indexed to, uint16 indexed pool, uint time);


    enum VoteType { ParameterChange, TokenIssue, PullRequest } //shows the type of a certain vote action
    enum VoteState { Pending, Successful, Unsuccessful } //if the voting is collecting votes, has finished successfully or unsuccessfully
    
    //A vote struct that indicates a certain action needs to be voted on to be successfully executed
    struct Vote {
        int[] arg2; //store data of the action
        uint votedFor; //sum of votes FOR
        uint votedAgainst; //sum of votes AGAINST
        uint endTime; //deadline for voting
        
        uint16[] arg1; //more data of the action
        
        VoteType voteType;
        VoteState voteState;
        bool exists;
        
        mapping(uint16 => bool) voted; //who has voted
        uint16 pool; //votes can only be inside a certain pool
        uint16 startedBy; //the initiator's ID
    }
    
    Vote[] activeVotes;
    
    mapping(uint16 => MembersLib.Member) members;
    uint16[] memberIds;
    
    mapping(uint16 => BonusPools.Pool) pools;
    uint16[] poolIds;
    
    mapping(address => uint16) memberAddresses; //to access the member id from his current address. Must be updated if a member's address changes
    
    uint16 memberCounter; //used to generate IDs
    uint16 poolCounter;
    
    uint firstBlockNumber; //used so that web3 knows from which block to start to scan for contract events (and extract them faster)
    
    address owner;
    
    uint constant voteTimeLimit = 1 weeks;
	
    function Obitcoin(){ //constructor
        owner = msg.sender;
        
        firstBlockNumber = block.number;
        
        memberCounter=1; //All IDs start from one to avoid the nature of solidity and it's uninitialized variables
        poolCounter=1;
    }
    
    function init(){
        if(owner != msg.sender || members[memberAddresses[owner]].exists) throw;
        members[memberAddresses[owner]].permLevel = MembersLib.PermLevel.owner;
        updateMember(0, "Coordinator", owner, true);
        members[memberAddresses[owner]].permLevel = MembersLib.PermLevel.owner;
        
        updateMember(0, "Pesho", 0x2e9Cf98A103148172B4e773F0ed2C58269A3fbd6, false);
        updateMember(0, "Georgi", 0xa0323703351Bc5e4905A5080d0f1e3fc4e57220f, false);
        
        updateDebtPool(0, "Save pesho", "ayy", "lmao");
        
        uint16[] memory toMembers = new uint16[](3);
        toMembers[0] = 1;
        toMembers[1] = 2;
        toMembers[2] = 3;
        int256[] memory amount = new int256[](3);
        amount[0] = 10;
        amount[1] = 20;
        amount[2] = 30;
        sendTokens(1, toMembers, amount);
    }
    
    function addMembers(){ //test method do add some fake members to the contract
        updateMember(0, "Pesho", address(memberCounter), false);
        updateMember(0, "Pesho", address(memberCounter), false);
        updateMember(0, "Pesho", address(memberCounter), false);
        updateMember(0, "Pesho", address(memberCounter), false);
        updateMember(0, "Pesho", address(memberCounter), false);
        
        uint16[] memory toMembers = new uint16[](5);
        toMembers[0] = memberCounter-1;
        toMembers[1] = memberCounter-2;
        toMembers[2] = memberCounter-3;
        toMembers[3] = memberCounter-4;
        toMembers[4] = memberCounter-5;
        int256[] memory amount = new int256[](5);
        amount[0] = 10;
        amount[1] = 20;
        amount[2] = 30;
        amount[3] = 40;
        amount[4] = 50;
        sendTokens(1, toMembers, amount);
    }
    
    modifier only(MembersLib.PermLevel level){ //only a person with the same or higher permission level is allowed to call the function
        if(members[memberAddresses[msg.sender]].permLevel >= level){
            _;
            return;
        }
        UnauthorizedAccess(memberAddresses[msg.sender], msg.sender, now);
    }
    
    modifier onlyPoolMember(uint16 pool) { //only a pool member of a certain pool is allowed to call the function
        for(uint16 i = 0; i<pools[pool].members.length; i++) if(pools[pool].members[i] == memberAddresses[msg.sender]){
            _;
            return;
        }
        UnauthorizedAccess(memberAddresses[msg.sender], msg.sender, now);
    }
    
    /*modifier checkActiveVotes(){ //TODO make the timings in the contract
        _;
    }*/
    
    function updateMember(uint16 member, bytes32 name, address adr, bool isAdmin) public only(MembersLib.PermLevel.owner) {
        if(member != 0 && !members[member].exists) throw;
        if(member != 0 && members[member].permLevel == MembersLib.PermLevel.owner) throw; //the owner should stay untouched
        if(memberAddresses[adr] != member && memberAddresses[adr] != 0) throw; //can't add this person if the same address is already in the system.
        
        bool added = member == 0;
        
        if(added){ //add the member
            member = memberCounter++;
            memberIds.push(member);
        }
        
        if(members[member].adr != adr){
            memberAddresses[members[member].adr] = 0;
            memberAddresses[adr] = member;
        }
        
        if(members[member].permLevel == MembersLib.PermLevel.admin != isAdmin){
            AdminChanged(memberAddresses[msg.sender], member, isAdmin, now);
        }
        
        members[member] = MembersLib.Member({name: name, adr: adr, permLevel: isAdmin ? MembersLib.PermLevel.admin : MembersLib.PermLevel.member, exists: true});
        
        PersonChanged(memberAddresses[msg.sender], member, added, now);
    }
    
    function updateDebtPool(uint16 pool, bytes16 name, bytes16 legalContract, bytes16 financialReports) public only(MembersLib.PermLevel.admin) {
        if(pool == 0){ //we need to add a pool, register the new ID
            pool = poolCounter++;
            poolIds.push(pool);
        }
        
        pools[pool].updateDebtPool(pool, name, legalContract, financialReports, memberAddresses[msg.sender]);
    }
	
	function getContractAddress() public constant returns (address){ //this method is used to test if the web application is connecting to an actual contract
        return this;
	}
	
	function getPublishingBlockNumber() public constant returns (uint){ //this method allows the web application to start extracting contract events after this block number
        return firstBlockNumber;
	}
	
	function getPools() public constant returns (uint16[]){
	    return poolIds;
	}
	
	function getPool(uint16 poolId) public constant returns (bytes16[3], uint16[], uint16[], uint128[3], uint128[3][]){
	    return pools[poolId].getPool();
	}
    
    function getMembers() public constant returns (uint16[], bytes32[], address[], MembersLib.PermLevel[]){
        bytes32[] memory names = new bytes32[](memberIds.length);
        address[] memory addresses = new address[](memberIds.length);
        MembersLib.PermLevel[] memory permLevels = new MembersLib.PermLevel[](memberIds.length);
        
        for(uint16 i = 0 ; i<memberIds.length; i++){
            names[i] = members[memberIds[i]].name;
            addresses[i] = members[memberIds[i]].adr;
            permLevels[i] = members[memberIds[i]].permLevel;
        }
        
        return (memberIds, names, addresses, permLevels);
    }
    
    function getVotesLength() public constant returns (uint){
        return activeVotes.length;
    }
    
    function getVote(uint16 voteIndex) public constant returns (VoteType, uint16, uint16[], int[], uint16, VoteState, uint, uint, uint, bool[] voted, uint16[] poolMembers){
        Vote vote = activeVotes[voteIndex];
        
        voted = new bool[](pools[vote.pool].members.length);
        
        for(uint16 i = 0; i<pools[vote.pool].members.length; i++){
            voted[i] = vote.voted[pools[vote.pool].members[i]];
        }
        
        return (vote.voteType, vote.pool, vote.arg1, vote.arg2, vote.startedBy, vote.voteState, vote.endTime, vote.votedFor, vote.votedAgainst, voted, pools[vote.pool].members);
    }
    
    //TODO check if the "to" is a valid member
    function delegateVote(uint16 poolId, uint16 to) public only(MembersLib.PermLevel.member){
        uint16 member = memberAddresses[msg.sender]; //get the ID of the caller
        BonusPools.Pool pool = pools[poolId];
        
        if(to != 0){
            if(pool.balance[to][1] == 0) throw; //if 'to' is not a member of the pool (aka has no slices in it)
            
            if(pool.delegations[to] != 0) pool.delegations[member] = pool.delegations[to]; //if the person we're delegating to has delegated
            else pool.delegations[member] = to; //just delegate otherwise
        } else pool.delegations[member] = 0;
        
        if(member == pool.delegations[member]) throw; //we cannot let the caller delegate to himself
        
        Delegation(member, pool.delegations[member], poolId, now);
        
        //if there are people delegating to us, delegate their vote to whoever we just delegated to
        for(uint i = 0; i<memberIds.length; i++){
            if(pool.delegations[memberIds[i]] == member){
                pool.delegations[memberIds[i]] = pool.delegations[member];
                Delegation(memberIds[i], pool.delegations[member], poolId, now);
            }
        }
        
        //TODO what if the person we're delegating TO has voted already??
    }
    
    function vote(uint16 voteIndex, bool voteFor) public onlyPoolMember(activeVotes[voteIndex].pool){
        Vote vote = activeVotes[voteIndex];
        
        BonusPools.Pool pool = pools[vote.pool];
        
        uint16 member = memberAddresses[msg.sender];
        
        if(vote.voted[member] || vote.voteState != VoteState.Pending) throw; //if the person has voted or the voting is closed
        if(pool.delegations[member] != 0 && pool.delegations[member] != member) throw; //you cannot vote if you've delegated
        vote.voted[member] = true;
        
        
        uint128 weight = pool.balance[member][0]; //the member's current tokens;
        
        Voted(memberAddresses[msg.sender], voteIndex, vote.pool, voteFor, now);
        
        for(uint i = 0; i<pool.members.length; i++){
            if(pool.delegations[pool.members[i]] == member && pool.members[i] != member){
                if(vote.voted[pool.members[i]]) continue; //if the person has already voted...somehow
                
                weight += pool.balance[pool.members[i]][0]; //add the person's tokens to the total weight of the vote
                vote.voted[pool.members[i]] = true;
                
                Voted(pool.members[i], voteIndex, vote.pool, voteFor, now);
            }
        }
        
        if(voteFor){
            vote.votedFor += weight;
            
            if(vote.votedFor >= pool.totalBalance[0]/2 + 1){ //if the vote has been reached successively
                vote.voteState = VoteState.Successful;
                
                if(vote.voteType == VoteType.TokenIssue){ //execute the transaction that was voted
                    executeTokenSending(vote.pool, vote.arg1, vote.arg2);
                }
                
                VoteChanged(vote.startedBy, voteIndex, vote.pool, vote.voteState, now);
            }
        }
        else{
            vote.votedAgainst += weight;
            
            if(vote.votedAgainst >= pool.totalBalance[0]/2 - pool.totalBalance[0]%2){ //if the vote hasn't been reached successively
                vote.voteState = VoteState.Unsuccessful;
                
                VoteChanged(vote.startedBy, voteIndex, vote.pool, vote.voteState, now);
            }
        }
        
        
    }
    
    function sendTokens(uint16 pool, uint16[] toMembers, int[] amount) public only(MembersLib.PermLevel.owner) {
        //check to see if the data is valid. The function sendTokens will further check if every pool and member exists.
        if(toMembers.length == 0 || amount.length == 0 || amount.length != toMembers.length) throw;
        if(!pools[pool].exists) throw;
        
        for(uint16 i = 0; i<toMembers.length; i++){
            if(amount[i] == 0 || !members[toMembers[i]].exists) throw;
        }
        
        if(pools[pool].members.length == 0){ //if there are no pool members, apply the changes without voting
            executeTokenSending(pool, toMembers, amount);
            return;
        }
        
        activeVotes.length++;
        Vote vote = activeVotes[activeVotes.length-1];
        
        vote.exists = true;
        vote.voteType = VoteType.TokenIssue;
        vote.voteState = VoteState.Pending;
        vote.startedBy = memberAddresses[msg.sender];
        vote.endTime = now + voteTimeLimit;
        vote.arg1 = toMembers;
        vote.pool = pool;
        vote.arg2 = amount;
        
        VoteChanged(vote.startedBy, (uint16)(activeVotes.length)-1, vote.pool, vote.voteState, now);
    }
    
    //possible bad situation: when voting is successful and this method is executed, in case it fails it leaves the voting to be "pending" forever.
    function executeTokenSending(uint16 pool, uint16[] toMembers, int[] totalAmount) private{
        pools[pool].executeTokenSending(pool, toMembers, totalAmount, memberAddresses[msg.sender]);
    }
    
    //this function uses the most gas. Split it on multiple calls to compensate for that. Perhaps make a call to split money for the first x members, then for the next x...
    function buyTokens(uint16 pool, uint128 amount) public only(MembersLib.PermLevel.admin) {
        //pools[pool].buyTokens(pool, amount, memberAddresses[msg.sender]);
    }
}