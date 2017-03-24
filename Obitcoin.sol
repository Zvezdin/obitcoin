pragma solidity ^0.4.9;

contract Obitcoin{
    address owner;
    
    enum PermLevel { none, member, admin, owner }

	struct Member {
	    bytes32 name; //maximum name length = 32 bytes. This is to avoid dynamic string, which is resource heavy. Can be changed
	    address adr; //current address of the person. Can be changed.
	    PermLevel permLevel; //current permission level. Can be changed to everything but owner.
	    bool exists;
	}
	
    struct Pool {
        bytes16 name;
        bytes16 legalContract;
        bytes16 financialReports;
        uint16[] members; //memberIds
        mapping (uint16 => uint128[3]) balance; //uint[0] = tokens, uint[1] = slices, uint[2] = balance
        uint128[3] totalBalance;
        bool exists;
    }
    
    enum VoteType { ParameterChange, TokenIssue, PullRequest }
    enum VoteState { Pending, Successful, Unsuccessful }
    
    struct Vote {
        bool exists;
        VoteType voteType;
        uint16 pool;
        uint16[] arg1;
        int[] arg2;

        uint votedFor;
        uint votedAgainst;
        
        mapping(uint16 => bool) voted;
        
        uint16 startedBy;
        
        VoteState voteState;
        
        uint endTime;
    }
    
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
	
	event VoteChanged(uint16 indexed from, uint16 indexed voteIndex, VoteType voteType, VoteState voteState, uint time);
	
	event Voted(uint16 indexed from, uint16 indexed voteIndex, VoteType voteType, bool vote, uint time);
	
    function Obitcoin(){ //constructor
        owner = msg.sender;
        
        firstBlockNumber = block.number;
        
        memberCounter=1; //All IDs start from one to avoid the nature of solidity and it's uninitialized variables
        poolCounter=1;
        
        members[memberAddresses[owner]].permLevel = PermLevel.owner;
        addMember("Owner", owner, true);
        members[memberAddresses[owner]].permLevel = PermLevel.owner;
        
        /*addMember("Pesho", 0x2e9Cf98A103148172B4e773F0ed2C58269A3fbd6, false);
        addMember("Georgi", 0xa0323703351Bc5e4905A5080d0f1e3fc4e57220f, false);
        
        createDebtPool("Save pesho", "ayy", "lmao");
        
        uint16[] memory toMembers = new uint16[](3);
        toMembers[0] = 1;
        toMembers[1] = 2;
        toMembers[2] = 3;
        int256[] memory amount = new int256[](3);
        amount[0] = 10;
        amount[1] = 20;
        amount[2] = 30;
        sendTokens(1, toMembers, amount);*/
    }
    
    
    modifier onlyOwner { //only the owner is allowed to call the function
        if (members[memberAddresses[msg.sender]].permLevel != PermLevel.owner){
			UnauthorizedAccess(memberAddresses[msg.sender], msg.sender, now);
            return;
		}
        _;
    }
    
    modifier onlyAdmin() { //only an admin is allowed to call the function
        if(members[memberAddresses[msg.sender]].permLevel == PermLevel.admin || members[memberAddresses[msg.sender]].permLevel == PermLevel.owner){
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
    
    modifier indexInRange(uint index, uint max) { //checks if a given index as a fuction argument is correct and doesn't cause exceptions
        if(index>=max)
            throw;
        _;
    }
    
    modifier checkActiveVotes(){
        _;
    }
    
    function addMember(bytes32 name, address adr, bool isAdmin) public onlyAdmin {
        if(adr == 0) throw; //don't want to add a null address
        if(memberAddresses[adr] != 0) throw; //can't add this person if the same address is already in the system.
        
        members[memberCounter] = Member(name, adr, isAdmin ? PermLevel.admin : PermLevel.member, true);
        memberAddresses[adr] = memberCounter;
        memberIds.push(memberCounter);
        
        PersonChanged(memberAddresses[msg.sender], memberCounter, true, now);
        
        memberCounter++;
    }
    
    function updateMember(uint16 member, bytes32 name, address adr, bool isAdmin) public onlyAdmin {
        if(!members[member].exists) throw;
        if(members[member].permLevel == PermLevel.owner) throw; //the owner should stay untouched
        if(memberAddresses[adr] != 0) throw; //can't add this person if the same address is already in the system.
        
        memberAddresses[members[member].adr] = 0;
        memberAddresses[adr] = member;
        
        members[member].name = name;
        members[member].adr = adr;
        
        if(members[member].permLevel == PermLevel.admin && !isAdmin || members[member].permLevel == PermLevel.member && isAdmin){ //if his admin state has changed
            AdminChanged(memberAddresses[msg.sender], member, isAdmin, now);
        }
        
        members[member].permLevel = isAdmin ? PermLevel.admin : PermLevel.member;
        
        PersonChanged(memberAddresses[msg.sender], member, false, now);
    }
    
    function createDebtPool(bytes16 name, bytes16 legalContract, bytes16 financialReports) public onlyAdmin {
        Pool p = pools[poolCounter];
        p.name = name;
        p.legalContract = legalContract;
        p.financialReports = financialReports;
        p.exists = true;
        poolIds.push(poolCounter);
        
        
		PoolChanged(memberAddresses[msg.sender], poolCounter, true, now);
		
		poolCounter++;
    }
    
    function updateDebtPool(uint16 pool, bytes16 name, bytes16 legalContract, bytes16 financialReports) public onlyAdmin {
        if(!pools[pool].exists) throw;
        
        pools[pool].name = name;
        pools[pool].legalContract = legalContract;
        pools[pool].financialReports = financialReports;
        
        PoolChanged(memberAddresses[msg.sender], pool, false, now);
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
    
    function getMembers() public constant returns (uint16[], bytes32[], address[], PermLevel[]){
        bytes32[] memory names = new bytes32[](memberIds.length);
        address[] memory addresses = new address[](memberIds.length);
        PermLevel[] memory permLevels = new PermLevel[](memberIds.length);
        
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
    
    function vote(uint16 voteIndex, bool voteFor) public onlyPoolMember(activeVotes[voteIndex].pool){
        Vote vote = activeVotes[voteIndex];
        uint16 member = memberAddresses[msg.sender];
        
        if(vote.voted[member] || vote.voteState != VoteState.Pending) throw;
        vote.voted[member] = true;
        if(voteFor){
            vote.votedFor += pools[vote.pool].balance[member][0];
        
            Voted(memberAddresses[msg.sender], voteIndex, vote.voteType, voteFor, now);
            
            if(vote.votedFor >= pools[vote.pool].totalBalance[0]/2 + 1){ //if the vote has been reached successively
                vote.voteState = VoteState.Successful;
                
                if(vote.voteType == VoteType.TokenIssue){ //execute the transaction that was voted
                    executeTokenSending(vote.pool, vote.arg1, vote.arg2);
                }
                
                VoteChanged(vote.startedBy, voteIndex, vote.voteType, vote.voteState, now);
            }
        }
        else{
            vote.votedAgainst += pools[vote.pool].balance[member][0];
            
            Voted(memberAddresses[msg.sender], voteIndex, vote.voteType, voteFor, now);
            
            if(vote.votedAgainst >= pools[vote.pool].totalBalance[0]/2 + 1){ //if the vote hasn't been reached successively
                vote.voteState = VoteState.Unsuccessful;
                
                VoteChanged(vote.startedBy, voteIndex, vote.voteType, vote.voteState, now);
            }
        }
        
        
    }
    
    function sendTokens(uint16 pool, uint16[] toMembers, int[] amount) public onlyOwner{
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
        vote.endTime = now + 1 weeks;
        vote.arg1 = toMembers;
        vote.pool = pool;
        vote.arg2 = amount;
        
        VoteChanged(vote.startedBy, (uint16)(activeVotes.length)-1, vote.voteType, vote.voteState, now);
    }
    
    function executeTokenSending(uint16 pool, uint16[] toMembers, int[] totalAmount) private{
        if(totalAmount.length != toMembers.length) throw;
        
        uint16 member;
        int amount;
        for(uint16 i=0; i< toMembers.length; i++){
            member = toMembers[i];
            amount = totalAmount[i];
            
            if(pools[pool].balance[member][0] + amount < pools[pool].balance[member][0]) throw; //avoid the 16-byte INT overflow
            if(pools[pool].balance[member][1] + amount < pools[pool].balance[member][1]) throw;
            if(-amount > pools[pool].balance[member][0]) throw; //if we'll have to subtract more tokens than available
            
            if(pools[pool].balance[member][0] == 0 && pools[pool].balance[member][1]==0) pools[pool].members.push(member); //if the member is not a member of the pool, add him
            
            if(amount>0){
                pools[pool].balance[member][0] += uint128(amount);
                pools[pool].balance[member][1] += uint128(amount);
                
                pools[pool].totalBalance[0] += uint128(amount);
                pools[pool].totalBalance[1] += uint128(amount);
            } else {
                pools[pool].balance[member][0] -= uint128(-amount);
                pools[pool].balance[member][1] -= uint128(-amount);
                
                pools[pool].totalBalance[0] -= uint128(-amount);
                pools[pool].totalBalance[1] -= uint128(-amount);
            }
            
            TokenTransfer(memberAddresses[msg.sender], member, pool, amount, now); //add to the current amount of tokens of the person
            SliceTransfer(memberAddresses[msg.sender], member, pool, amount, now); //add to the total amount of tokens of the person
        }
    }
    
    function buyTokens(uint16 pool, uint128 amount) public onlyAdmin {
        if(amount == 0 || !pools[pool].exists || pools[pool].members.length==0) throw;
        
        uint128 tokenSum = pools[pool].totalBalance[0];
        uint128 sliceSum = pools[pool].totalBalance[1];
        uint128 moneySum = pools[pool].totalBalance[2];
        uint128 totalSent = 0; //tracking how much is actually sent.
		
		uint i=0;
		
		for(i=0; i<pools[pool].members.length; i++){
		    tokenSum+=pools[pool].balance[pools[pool].members[i]][0]; //get the sum of the tokens in the pool.
		    sliceSum+=pools[pool].balance[pools[pool].members[i]][1];
		}
		
		if(sliceSum==0) throw; //we cannot split if we don't have any slices to split based on!
		
		i=0;
		
		uint16 member;
		uint128 debt;
		uint128 money;
		uint128 value;
		
	    //uint128[] memory slicesToApply = new uint128[](pools[pool].members.length);
		//int256[] memory tokensToApply = new int256[](pools[pool].members.length);
		
		if(tokenSum>0){
			for(i=0; i<pools[pool].members.length; i++){
			    member = pools[pool].members[i];
			    
				debt = pools[pool].balance[member][0]; //get the debt owed to the indexed person
				money = pools[pool].balance[member][2]; //get his money
				
				value = (debt*amount)/tokenSum; //calculate what part of the coins to buy.
				
				if(value>0){
    				if(debt-value>debt){ //if we're sending more than the token count of the person
        				TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(debt)), now);
        				MoneyTransfer(memberAddresses[msg.sender], member, pool, debt, now);
        				totalSent += debt;
        				money += debt;
        				debt = 0; //only clear the debt of the person, nothing else.
    				}
    				else {
        				TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(value)), now);
        				MoneyTransfer(memberAddresses[msg.sender], member, pool, value, now);
    					debt -= value;
    					money += value;
    					totalSent += value;
    				}
    				
    				pools[pool].balance[member][0] = debt;
    				pools[pool].balance[member][2] = money;
				}
			}
		}
		if(totalSent<amount){ //if there are leftover money, split them based on slice ratio
			for(i=0; i<pools[pool].members.length; i++){
			    member = pools[pool].members[i];
			    
				money = pools[pool].balance[member][2]; //get the money of the indexed person
				uint128 slices = pools[pool].balance[member][1]; //get his slices as well
				
				value = (slices*(amount-totalSent))/sliceSum; //calculate what part of the coins to buy.
				
				if(value>0){
    				money+=value;
    				totalSent+=value;
    				
    				pools[pool].balance[member][2] = money;
    				
        			MoneyTransfer(memberAddresses[msg.sender], member, pool, value, now);
				}
			}
		}
		
		if(totalSent<amount){ //if there are still leftover money, just give them to the newest member of the pool
		    member = pools[pool].members[pools[pool].members.length-1];
		    value = amount-totalSent;
		    debt = pools[pool].balance[member][0];
		    
		    if(debt>value){
		        debt-=value;
		        TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(value)), now);
		    } else if(debt>0) {
		        TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(debt)), now);
		        debt=0;
		    }
		    
		    pools[pool].balance[member][2]+=value;
		    pools[pool].balance[member][0]=debt;
		    MoneyTransfer(memberAddresses[msg.sender], member, pool, value, now);
		    totalSent = amount;
		}
        
		if(totalSent>amount) throw; //theorertically impossible
		
		tokenSum = 0;
		sliceSum = 0;
		moneySum = 0;
        for(i=0; i<pools[pool].members.length; i++){
            tokenSum+=pools[pool].balance[pools[pool].members[i]][0]; //get the sum of the tokens in the pool.
            sliceSum+=pools[pool].balance[pools[pool].members[i]][1];
            moneySum+=pools[pool].balance[pools[pool].members[i]][2];
        }
        pools[pool].totalBalance[0] = tokenSum;
        pools[pool].totalBalance[1] = sliceSum;
        pools[pool].totalBalance[2] = moneySum;
		
		TokenPurchase(memberAddresses[msg.sender], pool, totalSent, now);
    }
}