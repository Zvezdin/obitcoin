pragma solidity ^0.4.9;

contract Obitcoin{
    enum PermLevel { none, member, admin, owner }

    enum VoteType { ParameterChange, TokenIssue, PullRequest }
    enum VoteState { Pending, Successful, Unsuccessful }

	struct Member {
	    bytes32 name; //maximum name length = 32 bytes. This is to avoid dynamic string, which is resource heavy. Can be changed
	    PermLevel permLevel; //current permission level. Can be changed to everything but owner.
	    bool exists;
	    address adr; //current address of the person. Can be changed.
	}
	
    struct Pool {
        uint16[] members; //memberIds
        mapping (uint16 => uint128[3]) balance; //uint[0] = tokens, uint[1] = slices, uint[2] = balance
        uint128[3] totalBalance;
        bool exists;
        bytes16 name;
        bytes16 legalContract;
        bytes16 financialReports;
    }
    
    struct Vote {
        int[] arg2;
        uint votedFor;
        uint votedAgainst;
        uint endTime;
        
        uint16[] arg1;
        
        VoteType voteType;
        VoteState voteState;
        bool exists;
        
        mapping(uint16 => bool) voted;
        uint16 pool;
        uint16 startedBy;
    }
    
    //events for all actions made by the contract. They are fired by the contract, then catched and processed by the web application
    //once an event is fired, it will always stay in the blockchain. This is the why our application can load all transactions that ever occurred within the contracy
    //the contract has no access to previously fired events. That's why firing events is always cheaper than saving the same amount of data in contract storage
    event TokenTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time); //int256 because we can both remove and add tokens
    
    event MoneyTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, uint128 amount, uint time);
    
    event SliceTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time); //uint128 because we can only add slices
    
    event TokenPurchase(uint16 indexed from, uint16 indexed pool, uint128 amount, uint time);
    
	//event for the creaition of a pool, containing it's index for later access
    event PoolChanged(uint16 indexed from, uint16 indexed pool, bool added, uint time);
	
	//event to notify that someone has tried to access a method that he shouldn't have
	event UnauthorizedAccess(uint16 indexed from, address indexed fromAddress, uint time);
	
	//event to notify the removal or addition of an admin
	event AdminChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
	//event to notify the removal or addition of a person
	event PersonChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
	event VoteChanged(uint16 indexed from, uint16 indexed voteIndex, uint16 pool, VoteState voteState, uint time);
	
	event Voted(uint16 indexed from, uint16 indexed voteIndex, uint16 pool, bool vote, uint time);
	
	event Delegation(uint16 indexed from, uint16 indexed to, uint time);
    
    Vote[] activeVotes;
    
    mapping(uint16 => uint16) delegations;
    
    mapping(uint16 => Member) members;
    uint16[] memberIds;
    
    mapping(uint16 => Pool) pools;
    uint16[] poolIds;
    
    mapping(address => uint16) memberAddresses; //to access the member id from his current address. Must be updated if a member's address changes
    
    uint16 memberCounter;
    uint16 poolCounter;
    
    uint firstBlockNumber;
    
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
        members[memberAddresses[owner]].permLevel = PermLevel.owner;
        updateMember(0, "Coordinator", owner, true);
        members[memberAddresses[owner]].permLevel = PermLevel.owner;
        
        updateMember(0, "Pesho", 0x2e9Cf98A103148172B4e773F0ed2C58269A3fbd6, false);
        updateMember(0, "Georgi", 0xa0323703351Bc5e4905A5080d0f1e3fc4e57220f, false);
        updateMember(0, "Georgi", 0xfab77B58E626B9d9aC83942e50eE2015AaA73F42, false);
        updateMember(0, "Georgi", 0x32Fdc40a3Ce55Cc0B05CEE067dD9d8D1870A8DE2, false);
        updateMember(0, "Georgi", 0xD3d33b8EBD1b0307dd1Cc4226BA21f10eB98C1c1, false);
        updateMember(0, "Georgi", 0x5B95DF6Ed8EE3A9C06e6566891c7b804ADb4eedE, false);
        updateMember(0, "Georgi", 0xeA0c285d7fd3b08aD9E4CB416f9441A60DdaCd0b, false);
        updateMember(0, "Georgi", 0xA840BCfc12ce4a0a810149060B182265451d61fB, false);
        updateMember(0, "Georgi", 0x18A52f468ECc6E74596ae91F71b2842938C14ec2, false);
        
        updateDebtPool(0, "Save pesho", "ayy", "lmao");
        
        uint16[] memory toMembers = new uint16[](10);
        toMembers[0] = 1;
        toMembers[1] = 2;
        toMembers[2] = 3;
        toMembers[3] = 4;
        toMembers[4] = 5;
        toMembers[5] = 6;
        toMembers[6] = 7;
        toMembers[7] = 8;
        toMembers[8] = 9;
        toMembers[9] = 10;
        int256[] memory amount = new int256[](10);
        amount[0] = 10;
        amount[1] = 20;
        amount[2] = 30;
        amount[3] = 16;
        amount[4] = 24;
        amount[5] = 64;
        amount[6] = 34;
        amount[7] = 47;
        amount[8] = 23;
        amount[9] = 5;
        sendTokens(1, toMembers, amount);
    }
    
    modifier only(PermLevel level){ //only a person with the same or higher permission level is allowed to call the function
        if(members[memberAddresses[msg.sender]].permLevel >= level){
            _;
            return;
        }
        UnauthorizedAccess(memberAddresses[msg.sender], msg.sender, now);
    }
    
    modifier onlyPoolMember(uint16 pool) { //only a pool member is allowed to cll the function
        for(uint16 i = 0; i<pools[pool].members.length; i++) if(pools[pool].members[i] == memberAddresses[msg.sender]){
            _;
            return;
        }
        UnauthorizedAccess(memberAddresses[msg.sender], msg.sender, now);
    }
    
    /*modifier checkActiveVotes(){
        _;
    }*/
    
    function updateMember(uint16 member, bytes32 name, address adr, bool isAdmin) public only(PermLevel.owner) {
        if(member != 0 && !members[member].exists) throw;
        if(member != 0 && members[member].permLevel == PermLevel.owner) throw; //the owner should stay untouched
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
        
        if(members[member].permLevel == PermLevel.admin != isAdmin){
            AdminChanged(memberAddresses[msg.sender], member, isAdmin, now);
        }
        
        members[member] = Member({name: name, adr: adr, permLevel: isAdmin ? PermLevel.admin : PermLevel.member, exists: true});
        
        PersonChanged(memberAddresses[msg.sender], member, added, now);
    }
    
    function updateDebtPool(uint16 pool, bytes16 name, bytes16 legalContract, bytes16 financialReports) public only(PermLevel.admin) {
        if(pool != 0 && !pools[pool].exists) throw;
        
        bool added = pool == 0;
        
        if(added){ //create the pool
            pool = poolCounter++;
            poolIds.push(pool);
        }
        
        pools[pool].name = name;
        pools[pool].legalContract = legalContract;
        pools[pool].financialReports = financialReports;
        pools[pool].exists = true;
        
        PoolChanged(memberAddresses[msg.sender], pool, added, now);
    }
	
	function getContractAddress() public constant returns (address){ //this method is used to test if the web application is connecting to an actual contract
        return this;
	}
	
	function getPublishingBlockNumber() public constant returns (uint){
        return firstBlockNumber;
	}
	
	function getPools() public constant returns (uint16[]){
	    return poolIds;
	}
	
	function getPool(uint16 pool) public constant returns (bytes16[3], uint16[], uint128[3][]){
	    if(!pools[pool].exists) throw;
	    
	    bytes16[3] memory data;
	    uint128[3][] memory membersBalance = new uint128[3][](pools[pool].members.length);
	    
	    data[0] = pools[pool].name;
	    data[1] = pools[pool].legalContract;
	    data[2] = pools[pool].financialReports;
	    
	    for(uint16 i = 0; i<pools[pool].members.length; i++){
	        membersBalance[i] = pools[pool].balance[pools[pool].members[i]];
	    }
	    
	    return(data, pools[pool].members, membersBalance);
	}
    
    function getMembers() public constant returns (uint16[], bytes32[], address[], PermLevel[], uint16[]){
        bytes32[] memory names = new bytes32[](memberIds.length);
        address[] memory addresses = new address[](memberIds.length);
        PermLevel[] memory permLevels = new PermLevel[](memberIds.length);
        uint16[] memory delegateTo = new uint16[](memberIds.length);
        
        for(uint16 i = 0 ; i<memberIds.length; i++){
            names[i] = members[memberIds[i]].name;
            addresses[i] = members[memberIds[i]].adr;
            permLevels[i] = members[memberIds[i]].permLevel;
            delegateTo[i] = delegations[memberIds[i]];
        }
        
        return (memberIds, names, addresses, permLevels, delegateTo);
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
    function delegateVote(uint16 to) public only(PermLevel.member){
        uint16 member = memberAddresses[msg.sender]; //get the ID of the caller
        
        if(delegations[to] != 0) delegations[member] = delegations[to]; //if the person we're delegating to has delegated
        else delegations[member] = to; //just delegate otherwise
        
        if(member == delegations[member]) throw; //we cannot let the caller delegate to himself
        
        Delegation(member, delegations[member], now);
        
        //if there are people delegating to us, delegate their vote to whoever we just delegated to
        for(uint i = 0; i<memberIds.length; i++){
            if(delegations[memberIds[i]] == member){
                delegations[memberIds[i]] = delegations[member];
                Delegation(memberIds[i], delegations[member],now);
            }
        }
        
        //TODO what if the person we're delegating TO has voted already??
    }
    
    //TODO what if we have a delegation to someone outside our pool?
    function vote(uint16 voteIndex, bool voteFor) public onlyPoolMember(activeVotes[voteIndex].pool){
        Vote vote = activeVotes[voteIndex];
        
        Pool pool = pools[vote.pool];
        
        uint16 member = memberAddresses[msg.sender];
        
        if(vote.voted[member] || vote.voteState != VoteState.Pending) throw; //if the person has voted or the voting is closed
        if(delegations[member] != 0 && delegations[member] != member) throw; //you cannot vote if you've delegated
        vote.voted[member] = true;
        
        
        
        uint128 weight = pool.balance[member][0]; //the member's current tokens;
        
        Voted(memberAddresses[msg.sender], voteIndex, vote.pool, voteFor, now);
        
        for(uint i = 0; i<pool.members.length; i++){
            if(delegations[pool.members[i]] == member && pool.members[i] != member){
                if(vote.voted[pool.members[i]]) continue; //if the person has already voted...somehow
                
                weight += pool.balance[pool.members[i]][0];
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
            
            if(vote.votedAgainst >= pool.totalBalance[0]/2 + 1){ //if the vote hasn't been reached successively
                vote.voteState = VoteState.Unsuccessful;
                
                VoteChanged(vote.startedBy, voteIndex, vote.pool, vote.voteState, now);
            }
        }
        
        
    }
    
    function sendTokens(uint16 pool, uint16[] toMembers, int[] amount) public only(PermLevel.owner) {
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
        if(totalAmount.length != toMembers.length) throw;
        
        uint16 member;
        int amount;
        uint128[3] balance;
        
        for(uint16 i=0; i< toMembers.length; i++){
            member = toMembers[i];
            balance = pools[pool].balance[member];
            amount = totalAmount[i];
            
            if(balance[0] + amount < balance[0]) throw; //avoid the 16-byte INT overflow
            if(balance[1] + amount < balance[1]) throw;
            if(-amount > balance[0]) throw; //if we'll have to subtract more tokens than available
            
            if(balance[0] == 0 && balance[1]==0) pools[pool].members.push(member); //if the member is not a member of the pool, add him
            
            if(amount>0){
                balance[0] += uint128(amount);
                balance[1] += uint128(amount);
                
                pools[pool].totalBalance[0] += uint128(amount);
                pools[pool].totalBalance[1] += uint128(amount);
            } else {
                balance[0] -= uint128(-amount);
                balance[1] -= uint128(-amount);
                
                pools[pool].totalBalance[0] -= uint128(-amount);
                pools[pool].totalBalance[1] -= uint128(-amount);
            }
            
            TokenTransfer(memberAddresses[msg.sender], member, pool, amount, now); //add to the current amount of tokens of the person
            SliceTransfer(memberAddresses[msg.sender], member, pool, amount, now); //add to the total amount of tokens of the person
        }
    }
    
    //this function uses the most gas. Split it on multiple calls to compensate for that. Perhaps make a call to split money for the first x members, then for the next x...
    function buyTokens(uint16 pool, uint128 amount) public only(PermLevel.admin) {
        Pool debtPool = pools[pool];
        
        if(amount == 0 || !debtPool.exists || debtPool.members.length==0) throw;
        
        
        uint128[3] sum = debtPool.totalBalance; //get the token, money and slice sums. In an array because of the stack depth limit
        uint128 totalSent = 0; //tracking how much is actually sent.
		
		uint i=0;
		
		if(sum[1]==0) throw; //we cannot split if we don't have any slices to split based on!
		
		uint16 member;
		uint128 share;
		uint128 money;
		uint128 value;
		
		uint128 leftToSplit;
		
	    //int256[] memory moneyToApply = new int256[](pools[pool].members.length);
		//int256[] memory tokensToApply = new int256[](pools[pool].members.length);
		
		    
	    while(amount>totalSent){
	        leftToSplit = amount - totalSent; //what is left to split for this iteration of the loop
			for(i=0; i<debtPool.members.length; i++){
			    member = debtPool.members[i];
			    
				share = sum[0] > 0 ? debtPool.balance[member][0] : debtPool.balance[member][1]; //get the tokens or slices of that person
				money = debtPool.balance[member][2]; //get his money
				
				value = (share*leftToSplit)/(sum[0] > 0 ? debtPool.totalBalance[0] : sum[1]); //get the value that we're going to send to the member. Either buying coins or sending money directly. We're reading the token sum from there, because our local one is being modified constantly
				
				if(value == 0 && share > 0) value = 1; 
				
				if(value>0){
    				if(sum[0] > 0){ //if we're buying tokens
    				    if(value>share) value = share; //We can't buy more tokens than available
    				    
    				    TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(value)), now); //buy the tokens
    				    sum[0] -= value;
    				    debtPool.balance[member][0] -= value;
    				}
    				
    				MoneyTransfer(memberAddresses[msg.sender], member, pool, value, now); //transfer the money
    				totalSent += value;
    				money += value;
    				sum[2] += value;
    				
    				debtPool.balance[member][2] = money;
    				
    				if(totalSent >= amount) break;
				}
			}
		
	    }
        
		if(totalSent!=amount) throw; //if there was an error in the splitting algorithm
		
		TokenPurchase(memberAddresses[msg.sender], pool, totalSent, now);
    }
}