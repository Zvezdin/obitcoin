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
        mapping (uint16 => uint128[2]) balance; //uint[0] = tokens, uint[1] = slices
        bool exists;
    }
    
    mapping(uint16 => Member) members;
    uint16[] memberIds;
    
    mapping(uint16 => Pool) pools;
    uint16[] poolIds;
    
    mapping(address => uint16) memberAddresses; //to access the member id from his current address. Must be updated if a member's address changes
    
    uint16 memberCounter;
    uint16 poolCounter;
    
    uint32 firstBlockNumber;
    
    //event for any coin transfers happening
    event TokenTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time); //int256 because we can both remove and add tokens
    
    event SliceTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, uint128 amount, uint time); //int128 because we can only add slices
    
    event TokenPurchase(uint16 indexed from, uint16 indexed pool, uint128 amount, uint time);
    
	//event for the creaition of a pool, containing it's index for later access
    event PoolChanged(uint16 indexed from, uint16 indexed pool, bool added, uint time);
	
	//event to notify that someone has tried to access a method that he shouldn't have
	event UnauthorizedAccess(uint16 indexed from, address indexed fromAddress, uint time);
	
	//event to notify the removal or addition of an admin
	event AdminChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
	//event to notify the removal or addition of a person
	//unused as of now
	event PersonChanged(uint16 indexed from, uint16 indexed to, bool added, uint time);
	
    function Obitcoin(){ //constructor
        owner = msg.sender;
        
        firstBlockNumber = uint32 (block.number);
        
        memberCounter=1;
        poolCounter=1;
        
        members[memberCounter] = Member("Owner", msg.sender, PermLevel.owner, true);
        memberIds.push(memberCounter);
        memberAddresses[msg.sender] = memberCounter;
        
        memberCounter++;
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
        return;
    }
    
    modifier indexInRange(uint index, uint max) { //checks if a given index as a fuction argument is correct and doesn't cause exceptions
        if(index>=max)
            throw;
        _;
    }
    
    /*modifier isPersonInPool(uint8 index, address person){ //checks if a said address is a participant of the certain debt pool
        for(uint256 i=0; i<pools[index].people.length; i++){
            if(pools[index].people[i]==person){
                _;
                return;
            }
        }
        throw;
    }*/
    
    function addMember(bytes32 name, address adr, bool isAdmin) public onlyAdmin {
        if(adr == 0) throw;
        
        members[memberCounter] = Member(name, adr, isAdmin ? PermLevel.admin : PermLevel.member, true);
        memberAddresses[adr] = memberCounter;
        memberIds.push(memberCounter);
        
        PersonChanged(memberAddresses[msg.sender], memberCounter, true, now);
        
        memberCounter++;
    }
    
    function updateMember(uint16 member, bytes32 name, address adr, bool isAdmin) public onlyAdmin {
        if(!members[member].exists) throw;
        if(members[member].permLevel == PermLevel.owner) throw; //the owner should stay untouched
        
        memberAddresses[members[member].adr] = 65535;
        memberAddresses[adr] = member;
        
        members[member].name = name;
        members[member].adr = adr;
        members[member].permLevel = isAdmin ? PermLevel.admin : PermLevel.member;
        
        PersonChanged(memberAddresses[msg.sender], member, false, now);
    }
    
    function setAdmin(uint16 id, bool admin) public onlyOwner {
        if(!members[id].exists) throw;
        if(members[id].permLevel == PermLevel.owner) throw; //shouldn't let the owner be changed
        
        members[id].permLevel = admin ? PermLevel.admin : PermLevel.member;
        
        AdminChanged(memberAddresses[msg.sender], id, admin, now);
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
    
	//unable to make a good removal function, putting this on pause for now
	/*function addPersonToPool(uint8 index, address person, uint initialDebt) public onlyAdmin indexInRange(index, pools.length) {
		pools[index].people.push(person);
		pools[index].debt[person] = initialDebt;
	}*/
	
	function getContractAddress() public constant returns (address){
	    return this;
	}
	
	function getPublishingBlockNumber() public constant returns (uint32){
	    return firstBlockNumber;
	}
	
	function getPoolCount() public constant returns (uint){
		return poolIds.length;
	}
	
	function getPools() public constant returns (uint16[]){
	    return poolIds;
	}
	
	function getPoolData(uint16 pool) public constant returns(bytes16[3]){
	    if(!pools[pool].exists) throw;
	    return [pools[pool].name, pools[pool].legalContract, pools[pool].financialReports];
	}
	
	//returns a dynamic array. Due to EVM restrictions, this should only be called from web3.js and not other contracts!
    function getPoolParticipants(uint16 pool) public constant returns (uint16[]) {
        if(!pools[pool].exists) throw;
        return pools[pool].members;
    }
    
    function getMemberBalance(uint16 pool, uint16 member) public constant returns (uint128[2]) {
        if(!pools[pool].exists || !members[member].exists) throw;
        return pools[pool].balance[member];
    }
    
    function getMembersBalance(uint16 pool) public constant returns (uint128[2][], uint16[]) {
        if(!pools[pool].exists) throw;
        
        uint128[2][] memory balances = new uint128[2][](pools[pool].members.length);
        
        for(uint16 i=0; i<pools[pool].members.length; i++){
            balances[i] = pools[pool].balance[pools[pool].members[i]];
        }
        
        return (balances, pools[pool].members);
    }
    
    function getMembers() public constant returns (uint16[]){
        return memberIds;
    }
    
    /*function getMemberName(uint16 member) public constant returns (bytes32){
        if(!members[member].exists) throw;
        
        return members[member].name;
    }
    
    function getMemberAddress(uint16 member) public constant returns (address){
        if(!members[member].exists) throw;
        
        return members[member].adr;
    }
    
    function getMemberPermLevel(uint16 member) public constant returns (PermLevel){
        if(!members[member].exists) throw;
        
        return members[member].permLevel;
    }
    */
    
    function getMemberDetails(uint16 member) public constant returns (bytes32, address, PermLevel){
        if(!members[member].exists) throw;
        
        return (members[member].name, members[member].adr, members[member].permLevel);
    }
    
    function sendTokensBulk(uint16[] pools, uint16[] members, uint128[] amount){
        //check to see if the data is valid. The function sendTokens will further check if every pool and member exists.
        if(members.length == 0 || amount.length == 0 || pools.length == 0 || amount.length != members.length || members.length!=pools.length) throw;
        
        for(uint16 i = 0; i<members.length && i<amount.length && i<pools.length; i++){
            sendTokens(pools[i], members[i], amount[i]);
        }
    }
    
    function sendTokens(uint16 pool, uint16 member, uint128 amount) public onlyAdmin {
        if(amount == 0 || !pools[pool].exists || !members[member].exists) throw;
        
        if(pools[pool].balance[member][0] + amount < pools[pool].balance[member][0]) throw; //avoid the 16-byte INT overflow
        
        if(pools[pool].balance[member][0] == 0 && pools[pool].balance[member][1]==0) pools[pool].members.push(member);
        
        pools[pool].balance[member][0] += amount;
        
        TokenTransfer(memberAddresses[msg.sender], member, pool, int256 (amount), now); //Log the transaction
    }
    
	//track earned points overtime, if exess coins transferred, split them based on the total points.
	
    function buyTokens(uint16 pool, uint128 amount) public onlyAdmin {
        if(amount == 0 || !pools[pool].exists || pools[pool].members.length==0) throw;
        
        uint128 tokenSum = 0;
        uint128 sliceSum = 0;
        uint128 totalSent = 0; //tracking how much is actually sent.
		
		uint i=0;
		
		for(i=0; i<pools[pool].members.length; i++){
		    tokenSum+=pools[pool].balance[pools[pool].members[i]][0]; //get the sum of the tokens in the pool.
		    sliceSum+=pools[pool].balance[pools[pool].members[i]][1];
		}
		
		i=0;
		
		uint16 member;
		uint128 debt;
		uint128 slices;
		uint128 value;
		
	    //uint128[] memory slicesToApply = new uint128[](pools[pool].members.length);
		//int256[] memory tokensToApply = new int256[](pools[pool].members.length);
		
		if(tokenSum>0){
			for(i=0; i<pools[pool].members.length; i++){
			    member = pools[pool].members[i];
			    
				debt = pools[pool].balance[member][0]; //get the debt of the indexed person
				
				slices = pools[pool].balance[member][1];
				
				value = (debt*amount)/tokenSum; //calculate what part of the coins to buy.
				
				if(value>0 && debt>0){
    				if(debt-value>debt){ //if we're sending more than the token count of the person
        				TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(debt)), now);
        				SliceTransfer(memberAddresses[msg.sender], member, pool, debt, now);
        				totalSent+=debt;
        				slices +=debt;
        				sliceSum += debt;
        				debt = 0; //only clear the debt of the person, nothing else.
    				}
    				else {
        				TokenTransfer(memberAddresses[msg.sender], member, pool, -(int(value)), now);
        				SliceTransfer(memberAddresses[msg.sender], member, pool, value, now);
    					debt -= value;
    					slices += value;
    					sliceSum += value;
    					totalSent+=value;
    				}
    				
    				pools[pool].balance[member][0] = debt;
    				pools[pool].balance[member][1] = slices;
				}
			}
		}
		if(totalSent<amount){ //if there are leftover money, split them based on slice ratio
	        if(sliceSum>0){
    			for(i=0; i<pools[pool].members.length; i++){
    			    member = pools[pool].members[i];
    			    
    				slices = pools[pool].balance[member][1]; //get the slices of the indexed person
    				
    				value = (slices*(amount-totalSent))/sliceSum; //calculate what part of the coins to buy.
    				
    				if(value>0){
        				slices+=value;
        				totalSent+=value;
        				
        				pools[pool].balance[member][1] = slices;
        				
            			SliceTransfer(memberAddresses[msg.sender], member, pool, value, now);
    				}
    			}
    		}
    		else {
    		    //log an error: unable to split 
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
		    
		    pools[pool].balance[member][1]+=value;
		    pools[pool].balance[member][0]=debt;
		    SliceTransfer(memberAddresses[msg.sender], member, pool, value, now);
		    totalSent = amount;
		}
		
		/*for(i=0; i<pools[pool].members.length; i++){
		    //SliceTransfer(memberAddresses[msg.sender], pools[pool].members[i], pool, slicesToApply[i]-pools[pool].balance[pools[pool].members[i]][1], now);
		    
		    pools[pool].balance[pools[pool].members[i]][1] = slicesToApply[i];
		}*/
		
		if(totalSent>amount) throw; //theorertically impossible
		TokenPurchase(memberAddresses[msg.sender], pool, totalSent, now);
    }
}