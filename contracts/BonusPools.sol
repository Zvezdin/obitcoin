pragma solidity ^0.4.9;

library BonusPools {
    
    //events for all actions made by the contract. They are fired by the contract, then catched and processed by the web application
    //once an event is fired, it will always stay in the blockchain. This is the why our application can load all transactions that ever occurred within the contracy
    //the contract has no access to previously fired events. That's why firing events is always cheaper than saving the same amount of data in contract storage
    event TokenTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time); //int256 because we can both remove and add tokens
    
    event MoneyTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time);
    
    event SliceTransfer(uint16 indexed from, uint16 indexed to, uint16 indexed pool, int256 amount, uint time); //uint128 because we can only add slices
    
    event TokenPurchase(uint16 indexed from, uint16 indexed pool, uint128 amount, uint time);
    
	//event for the creaition of a pool, containing it's index for later access
    event PoolChanged(uint16 indexed from, uint16 indexed pool, bool added, uint time);
    
    struct Pool { //the struct of a cooperative debt pool (containing members working on a certain action)
        uint16[] members; //memberIds
        mapping (uint16 => uint128[3]) balance; //the balance of each member
        //uint[0] = tokens, uint[1] = slices, uint[2] = balance
        mapping (uint16 => uint16) delegations; //who to who is delegating his voting rights
        uint128[3] totalBalance; //sum of balance for all pool members
        bool exists;
        bytes16 name;
        bytes16 legalContract;
        bytes16 financialReports;
    }
    //Each Pool has an ID of type uint16
    
	function getPool(Pool storage pool) internal returns (bytes16[3], uint16[], uint16[], uint128[3], uint128[3][]){
	    if(!pool.exists) throw;
	    
	    
	    bytes16[3] memory data;
	    uint128[3][] memory membersBalance = new uint128[3][](pool.members.length);
	    uint16[] memory delegations = new uint16[](pool.members.length);
	    
	    data[0] = pool.name;
	    data[1] = pool.legalContract;
	    data[2] = pool.financialReports;
	    
	    for(uint16 i = 0; i<pool.members.length; i++){
	        membersBalance[i] = pool.balance[pool.members[i]];
	        delegations[i] = pool.delegations[pool.members[i]];
	    }
	    
	    return(data, pool.members, delegations, pool.totalBalance, membersBalance);
	}
    
    function updateDebtPool(Pool storage debtPool, uint16 pool, bytes16 name, bytes16 legalContract, bytes16 financialReports, uint16 sender) internal {
        if(pool != 0 && !debtPool.exists) throw;
        
        bool added = !debtPool.exists;
        
        debtPool.name = name;
        debtPool.legalContract = legalContract;
        debtPool.financialReports = financialReports;
        debtPool.exists = true;
        
        PoolChanged(sender, pool, added, now);
    }
    
    //possible bad situation: when voting is successful and this method is executed, in case it fails it leaves the voting to be "pending" forever.
    function executeTokenSending(Pool storage debtPool, uint16 pool, uint16[] toMembers, int[] totalAmount, uint16 sender) internal {
        if(totalAmount.length != toMembers.length) throw;
        
        uint16 member;
        int amount;
        uint128[3] balance;
        
        for(uint16 i=0; i< toMembers.length; i++){
            member = toMembers[i];
            balance = debtPool.balance[member];
            amount = totalAmount[i];
            
            if(balance[0] + amount < balance[0]) throw; //avoid the 16-byte INT overflow
            if(balance[1] + amount < balance[1]) throw;
            if(-amount > balance[0]) throw; //if we'll have to subtract more tokens than available
            
            if(balance[0] == 0 && balance[1]==0) debtPool.members.push(member); //if the member is not a member of the pool, add him
            
            if(amount>0){
                balance[0] += uint128(amount);
                balance[1] += uint128(amount);
                
                debtPool.totalBalance[0] += uint128(amount);
                debtPool.totalBalance[1] += uint128(amount);
            } else {
                balance[0] -= uint128(-amount);
                balance[1] -= uint128(-amount);
                
                debtPool.totalBalance[0] -= uint128(-amount);
                debtPool.totalBalance[1] -= uint128(-amount);
            }
            
            TokenTransfer(sender, member, pool, amount, now); //add to the current amount of tokens of the person
            SliceTransfer(sender, member, pool, amount, now); //add to the total amount of tokens of the person
        }
    }
    
    //this function uses the most gas. Split it on multiple calls to compensate for that. Perhaps make a call to split money for the first x members, then for the next x...
    function buyTokens(Pool storage debtPool, uint16 pool, uint128 amount, uint16 sender) internal {
        if(amount == 0 || !debtPool.exists || debtPool.members.length==0) throw;
        
        
        //memory, because the array is copied and not referenced (which we want, because writing to storage is expensive)
        uint128[3] memory sum = debtPool.totalBalance; //get the token, money and slice sums. In an array because of the stack depth limit
        uint128 totalSent = 0; //tracking how much is actually sent.
		
		uint i=0;
		
		if(sum[1]==0) throw; //we cannot split if we don't have any slices to split based on!
		
		uint16 member;
		uint128 share;
		uint128 value;
		
		uint128 leftToSplit;
		
	    int256[] memory moneyToApply = new int256[](debtPool.members.length); //to avoid additional writes to storage, we're doing everything on memory and applying it afterwards in storage
		int256[] memory tokensToApply = new int256[](debtPool.members.length);
		
		bool stage1 = sum[0] > 0;
		    
	    while(amount>totalSent){ //ideally the loop should terminate after 1 to 3 iterations
	        leftToSplit = amount - totalSent; //what is left to split for this iteration of the loop
			
    		for(i=0; i<debtPool.members.length; i++){
    		    member = debtPool.members[i];
    		    
    			share = stage1 ? debtPool.balance[member][0] : debtPool.balance[member][1]; //get the tokens or slices of that person
    			
    			value = (share*leftToSplit)/(stage1 ? debtPool.totalBalance[0] : sum[1]); //get the value that we're going to send to the member. Either buying coins or sending money directly. We're reading the token sum from there, because our local one is being modified constantly
    			
    			if(i == debtPool.members.length-1 && (!stage1 || amount-totalSent <= sum[0]) ){ //if we're at the last iteration of the main and inner loop
    			    value = amount-totalSent; //transfer what's left from integer arithmetics inaccuracies
    			}
    			
    			
    			if(tokensToApply[i] == 0 && moneyToApply[i] == 0){ //copy the member's balance to memory if we haven't already
    			    tokensToApply[i] = debtPool.balance[member][0]; //this is done to avoid expensive excessive storage I/O
    			    moneyToApply[i] = debtPool.balance[member][2];
    			}
    			
    			if(value == 0){
                    continue; //no need to waste gas if we're not doing anything
    			}
    			
				if(stage1){ //if we're buying tokens
				    if(value>share) value = share; //We can't buy more tokens than available
				    
				    sum[0] -= value; //update the total balance of the pool
				    tokensToApply[i] -= value; //subtract the tokens from the member
				}
				
				totalSent += value; //track how much was sent
				sum[2] += value; //update the total balance of the pool
				
				moneyToApply[i] += value; //update the member's money
				
				if(!stage1 || amount-totalSent <= sum[0]){ //if we're at the last iteration of the main loop and we need to write the changes to storage
				    if(tokensToApply[i] != debtPool.balance[member][0]){ //if we've removed any tokens of that person
				        TokenTransfer(sender, member, pool, tokensToApply[i] - int256(debtPool.balance[member][0]), now); //send the event
				    }
				    if(moneyToApply[i] != debtPool.balance[member][2]){ //if this person's money have changed
				        MoneyTransfer(sender, member, pool, moneyToApply[i] - int256(debtPool.balance[member][2]), now); //send the event
				    }
				    
				    debtPool.balance[member][0] = uint128(tokensToApply[i]);
				    debtPool.balance[member][2] = uint128(moneyToApply[i]);
				}
				
				if(totalSent >= amount) break; //avoid useless looping if we're done
    		}
    		
    		stage1 = false;
	    }
        
        debtPool.totalBalance = sum;
        
		if(totalSent!=amount) throw; //if there was an error in the splitting algorithm
		
		TokenPurchase(sender, pool, totalSent, now);
    }
}