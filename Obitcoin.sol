pragma solidity ^0.4.0;

contract Obitcoin{
    
    address private owner;
    mapping (address => bool) admins;
    
	//global level array of members
	
    struct DebtPool {
        address[] people;
        mapping (address => uint) debt;
    }
	
    DebtPool[] private pools;
    
    //event for any coin transfers happening
    event CoinsTransfer(address indexed from, address indexed to, uint8 poolIndex, int amount, uint time);
    
    event CoinsPurchase(address indexed from, uint8 indexed poolIndex, uint amount, uint time);
    
	//event for the creaition of a pool, containing it's index for later access
    event PoolCreated(uint8 index, address indexed by, uint time);
	
	//event to notify that someone has tried to access a method that he shouldn't have
	event UnauthorizedAccess(address from, uint time);
	
	//event to notify the removal or addition of an admin
	event AdminChanged(address person, bool added, uint time);
	
	//event to notify the removal or addition of a person in a certain debt pool
	//unused as of now
	event PersonChanged(address person, bool added, uint8 poolIndex, uint time);
	
    function Obitcoin(){ //constructor
        owner = msg.sender;
        admins[owner] = true;
    }
    
    
    modifier onlyOwner { //only the owner is allowed to call the function
        if (msg.sender != owner){
			UnauthorizedAccess(msg.sender, now);
            return;
		}
        _;
    }
    
    modifier onlyAdmin() { //only an admin is allowed to call the function
        if(!admins[msg.sender]){
			UnauthorizedAccess(msg.sender, now);
            return;
		}
        _;
    }
    
    modifier indexInRange(uint index, uint max) { //checks if a given index as a fuction argument is correct and doesn't cause exceptions
        if(index>=max)
            throw;
        _;
    }
    
    modifier isPersonInPool(uint8 index, address person){ //checks if a said address is a participant of the certain debt pool
        for(uint256 i=0; i<pools[index].people.length; i++){
            if(pools[index].people[i]==person){
                _;
                return;
            }
        }
        throw;
    }
    
    function addAdmin(address adminToAdd) public onlyOwner {
        AdminChanged(adminToAdd, true, now);
        admins[adminToAdd] = true;
    }
    
    function removeAdmin(address adminToRemove) public onlyOwner { //Problematic. Seems to be a bug in solidity (setting a bool to false). Don't use as of now.
        AdminChanged(adminToRemove, false, now);
        admins[adminToRemove] = false; //the problematic line
    }
    
    function createDebtPool(address[] people) public onlyAdmin {
        pools.push(DebtPool(people));
		PoolCreated(uint8(pools.length-1), msg.sender, now);
    }
    
	//unable to make a good removal function, putting this on pause for now
	/*function addPersonToPool(uint8 index, address person, uint initialDebt) public onlyAdmin indexInRange(index, pools.length) {
		pools[index].people.push(person);
		pools[index].debt[person] = initialDebt;
	}*/
	
	function getPoolCount() public constant returns (uint){
		return pools.length;
	}
	
	//returns a dynamic array. Due to EVM restrictions, this should only be called from web3.js and not other contracts!
    function getPoolParticipants(uint8 index) public indexInRange(index, pools.length) constant returns (address[]) {
        return pools[index].people;
    }
    
    function getPersonDebt(uint8 index, address person) public indexInRange(index, pools.length)  isPersonInPool(index, person) constant returns (uint) {
        return pools[index].debt[person];
    }
    
    function sendCoins(uint8 index, address person, uint amount) public onlyAdmin indexInRange(index, pools.length) isPersonInPool(index, person) {
        if(pools[index].debt[person] + amount < pools[index].debt[person]) throw; //avoid the 32-byte INT overflow
        pools[index].debt[person] += amount;
        
        CoinsTransfer(msg.sender, person, index, int (amount), now); //Log the transaction
    }
    
	//track earned points overtime, if exess coins transferred, split them based on the total points.
	
    function buyCoins(uint8 index, uint amount) public onlyAdmin indexInRange(index, pools.length) {
        uint sum = 0;
        uint totalSent = 0; //tracking how much is actually sent.
		
		uint i=0;
		
		for(i=0; i<pools[index].people.length; i++) sum+=pools[index].debt[pools[index].people[i]];
		i=0;
		
		if(sum>0){
			for(i=0; i<pools[index].people.length; i++){
				uint debt = pools[index].debt[pools[index].people[i]]; //get the debt of the indexed person
				
				uint value = (debt*amount)/sum; //calculate what part of the coins to buy.
				
				if(debt-value>debt){
					CoinsTransfer(msg.sender, pools[index].people[i], index, -(int(debt)), now);
					debt = 0; //TODO do something with the extra value
					totalSent+=debt;
				}
				else{
					CoinsTransfer(msg.sender, pools[index].people[i], index, -(int(value)), now);
					debt -= value;
					totalSent+=value;
				}
				
				pools[index].debt[pools[index].people[i]] = debt;
			}
		}
		CoinsPurchase(msg.sender, index, totalSent, now);
    }
}