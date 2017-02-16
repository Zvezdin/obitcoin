var accounts;
var account;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

var Obitcoin;

var contractAbi = [{"constant":false,"inputs":[{"name":"index","type":"uint8"},{"name":"amount","type":"uint256"}],"name":"buyCoins","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"adminToRemove","type":"address"}],"name":"removeAdmin","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getContractAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint8"}],"name":"getPoolParticipants","outputs":[{"name":"","type":"address[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint8"},{"name":"person","type":"address"}],"name":"getPersonDebt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint8"},{"name":"person","type":"address"},{"name":"amount","type":"uint256"}],"name":"sendCoins","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"adminToAdd","type":"address"}],"name":"addAdmin","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getPoolCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"people","type":"address[]"}],"name":"createDebtPool","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"poolIndex","type":"uint8"},{"indexed":false,"name":"amount","type":"int256"},{"indexed":false,"name":"time","type":"uint256"}],"name":"CoinsTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"poolIndex","type":"uint8"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"time","type":"uint256"}],"name":"CoinsPurchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"index","type":"uint8"},{"indexed":true,"name":"by","type":"address"},{"indexed":false,"name":"time","type":"uint256"}],"name":"PoolCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"time","type":"uint256"}],"name":"UnauthorizedAccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"person","type":"address"},{"indexed":false,"name":"added","type":"bool"},{"indexed":false,"name":"time","type":"uint256"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"person","type":"address"},{"indexed":false,"name":"added","type":"bool"},{"indexed":false,"name":"poolIndex","type":"uint8"},{"indexed":false,"name":"time","type":"uint256"}],"name":"PersonChanged","type":"event"}];

var contractCompiled = '6060604052341561000c57fe5b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160016000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b5b611564806100d96000396000f3006060604052361561008c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806301259c9d1461008e5780631785f53c146100ba57806369813f66146100f05780636d95e3e8146101765780636eab0450146101cc57806370480275146102175780638eec5d701461024d578063a05ff7f914610273575bfe5b341561009657fe5b6100b8600480803560ff169060200190919080359060200190919050506102ca565b005b34156100c257fe5b6100ee600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610903565b005b34156100f857fe5b610111600480803560ff16906020019091905050610a9f565b6040518080602001828103825283818151815260200191508051906020019060200280838360008314610163575b8051825260208311156101635760208201915060208101905060208303925061013f565b5050509050019250505060405180910390f35b341561017e57fe5b6101b6600480803560ff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610b76565b6040518082815260200191505060405180910390f35b34156101d457fe5b610215600480803560ff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610ceb565b005b341561021f57fe5b61024b600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190505061107e565b005b341561025557fe5b61025d61121a565b6040518082815260200191505060405180910390f35b341561027b57fe5b6102c8600480803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091905050611228565b005b60006000600060006000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515610397577f43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a3342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a16108fa565b8660ff1660028054905080821015156103af57610000565b600096506000955060009450600094505b60028960ff168154811015156103d257fe5b906000526020600020906002020160005b50600001805490508510156104c95760028960ff1681548110151561040457fe5b906000526020600020906002020160005b50600101600060028b60ff1681548110151561042d57fe5b906000526020600020906002020160005b506000018781548110151561044f57fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054870196505b84806001019550506103c0565b60009450600087111561089b57600094505b60028960ff168154811015156104ed57fe5b906000526020600020906002020160005b506000018054905085101561089a5760028960ff1681548110151561051f57fe5b906000526020600020906002020160005b50600101600060028b60ff1681548110151561054857fe5b906000526020600020906002020160005b506000018781548110151561056a57fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549350868885028115156105e157fe5b0492508383850311156106da5760028960ff1681548110151561060057fe5b906000526020600020906002020160005b506000018581548110151561062257fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b8b8760000342604051808460ff1660ff168152602001838152602001828152602001935050505060405180910390a36000935083860195506107c3565b60028960ff168154811015156106ec57fe5b906000526020600020906002020160005b506000018581548110151561070e57fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b8b8660000342604051808460ff1660ff168152602001838152602001828152602001935050505060405180910390a3828403935082860195505b8360028a60ff168154811015156107d657fe5b906000526020600020906002020160005b50600101600060028c60ff168154811015156107ff57fe5b906000526020600020906002020160005b506000018881548110151561082157fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b84806001019550506104db565b5b8860ff163373ffffffffffffffffffffffffffffffffffffffff167f0a2bc3adb8c2b63fe95851175d2c67b4d7233c829426007bd87b77a1bc0537ca8842604051808381526020018281526020019250505060405180910390a35b5b50505b50505050505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156109ca577f43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a3342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1610a9c565b7f93d0a7c15c7563d9be4a11e86b41c8d9e139dc0a4d5ac958f76b611654a4cb9681600042604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183151515158152602001828152602001935050505060405180910390a16000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b5b50565b610aa76113ae565b8160ff166002805490508082101515610abf57610000565b60028460ff16815481101515610ad157fe5b906000526020600020906002020160005b50600001805480602002602001604051908101604052809291908181526020018280548015610b6657602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311610b1c575b505050505092505b5b5050919050565b60008260ff166002805490508082101515610b9057610000565b84846000600090505b60028360ff16815481101515610bab57fe5b906000526020600020906002020160005b5060000180549050811015610cda578173ffffffffffffffffffffffffffffffffffffffff1660028460ff16815481101515610bf457fe5b906000526020600020906002020160005b5060000182815481101515610c1657fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415610ccc5760028860ff16815481101515610c7157fe5b906000526020600020906002020160005b5060010160008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205495505b610cdf565b5b8080600101915050610b99565b610000565b5050505b505092915050565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515610dae577f43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a3342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1611079565b8260ff166002805490508082101515610dc657610000565b84846000600090505b60028360ff16815481101515610de157fe5b906000526020600020906002020160005b506000018054905081101561106d578173ffffffffffffffffffffffffffffffffffffffff1660028460ff16815481101515610e2a57fe5b906000526020600020906002020160005b5060000182815481101515610e4c57fe5b906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561105f5760028860ff16815481101515610ea757fe5b906000526020600020906002020160005b5060010160008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548660028a60ff16815481101515610f0d57fe5b906000526020600020906002020160005b5060010160008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054011015610f6c57610000565b8560028960ff16815481101515610f7f57fe5b906000526020600020906002020160005b5060010160008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b8a8942604051808460ff1660ff168152602001838152602001828152602001935050505060405180910390a35b611072565b5b8080600101915050610dcf565b610000565b5050505b50505b505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515611145577f43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a3342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1611217565b7f93d0a7c15c7563d9be4a11e86b41c8d9e139dc0a4d5ac958f76b611654a4cb9681600142604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183151515158152602001828152602001935050505060405180910390a16001600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505b5b50565b600060028054905090505b90565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1615156112eb577f43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a3342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a16113ab565b600280548060010182816112ff91906113c2565b916000526020600020906002020160005b60206040519081016040528085815250909190915060008201518160000190805190602001906113419291906113f4565b505050503373ffffffffffffffffffffffffffffffffffffffff167f0e127b5107fa3bc272d8be8ef2c38e3749b255150965c51d9c598a62e7ce26fd60016002805490500342604051808360ff1660ff1681526020018281526020019250505060405180910390a25b5b50565b602060405190810160405280600081525090565b8154818355818115116113ef576002028160020283600052602060002091820191016113ee919061147e565b5b505050565b82805482825590600052602060002090810192821561146d579160200282015b8281111561146c5782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555091602001919060010190611414565b5b50905061147a91906114ae565b5090565b6114ab91905b808211156114a757600060008201600061149e91906114f1565b50600201611484565b5090565b90565b6114ee91905b808211156114ea57600081816101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055506001016114b4565b5090565b90565b508054600082559060005260206000209081019061150f9190611513565b5b50565b61153591905b80821115611531576000816000905550600101611519565b5090565b905600a165627a7a72305820722028728a4816ea25e3a294030c26634de954023e594fc4a7261e9ff59142020029';

var contractGas = '4700000';

function deployNewContract() {
	
	var obitcoinContract = web3.eth.contract(contractAbi);
	Obitcoin = obitcoinContract.new(
	   {
		 from: web3.eth.accounts[0], 
		 data: contractCompiled, 
		 gas: contractGas
	   }, function (e, contract){
		console.log(e, contract);
		if (typeof contract.address !== 'undefined') {
			 console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			 
			 startListeningForEvents();
		}
	 })
}

function connectToContract() {
	
	var obitcoinContract = web3.eth.contract(contractAbi);
	
	var address = document.getElementById("contractAddress").value;
	Obitcoin = obitcoinContract.at(address);
	
	Obitcoin.getContractAddress.call({from: account}, function(error, result){
		if(!error)
			if(result==address){
				console.log("Connection successful");
				
				//startListeningForEvents();
			} else {
				console.log("Invalid address!");
			}
		else
			console.error(error);
	});
}

function addAdmin(person) {
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.addAdmin(person, {from: account}, function(error, result){
		if(!error)
			console.log(result);
		else
			console.error(error);
	});
}

function removeAdmin(person) {
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.removeAdmin(person, {from: account}, function(error, result){
		if(!error)
			console.log(result);
		else
			console.error(error);
	});
}

function createDebtPool(participants) {
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.createDebtPool(participants, {from: account}, function(error, result){
		if(!error)
			console.log(result);
		else
			console.error(error);
	});
}

function getPoolParticipants(index) {
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.getPoolParticipants.call(index, {from: account}, function(error, result){
		if(!error)
			console.log(result);
		else
			console.error(error);
	});
}

function getPersonDebt(index, person){
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.getPersonDebt.call(index, person, {from: account}, function(error, result){
		if(!error)
			console.log(result.valueOf());
		else
			console.error(error);
	});
}

function sendCoins(index, person, amount){
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.sendCoins(index, person, amount, {from: account}, function(error, result){
		if(!error)
			console.log(result)
		else
			console.error(error);
	});
}

function buyCoins(index, amount){
	var obitcoin = Obitcoin;//.deployed();
	
	obitcoin.buyCoins(index, amount, {from: account}, function(error, result){
		if(!error)
			console.log(result)
		else
			console.error(error);
	});
}


function startListeningForEvents(){
	var obitcoin = Obitcoin;//.deployed();
	var coinsTransferEvent = obitcoin.CoinsTransfer({}, {fromBlock: 0});
	coinsTransferEvent.watch(function(err, result) {
		if (err) {
			console.log(err)
			return;
		}
		console.log("["+result.args.time.valueOf()+"] sent "+result.args.amount.valueOf()+" from "+result.args.from+" to "+result.args.to);
	});
	
	var coinsPurchaseEvent = obitcoin.CoinsPurchase({}, {fromBlock: 0});
	coinsPurchaseEvent.watch(function(err, result) {
		if (err) {
			console.log(err)
			return;
		}
		console.log("["+result.args.time.valueOf()+"] bought "+result.args.amount.valueOf()+" from "+result.args.from+" to "+result.args.poolIndex+" debt pool");
	});
	
	var poolCreatedEvent = obitcoin.PoolCreated({}, {fromBlock: 0});
	poolCreatedEvent.watch(function(err,result) {
		if(err) {
			console.log(err);
			return;
		}
		console.log("["+result.args.time.valueOf()+"] created pool with index "+result.args.index.valueOf());
	});
	
	var unauthorizedAccessEvent = obitcoin.UnauthorizedAccess({}, {fromBlock: 0});
	unauthorizedAccessEvent.watch(function(err,result) {
		if(err) {
			console.log(err);
			return;
		}
		console.log("["+result.args.time.valueOf()+"] Warning! Unauthorized access from "+result.args.from);
	});
	
	var adminChangedEvent = obitcoin.AdminChanged({}, {fromBlock: 0});
	adminChangedEvent.watch(function(err,result) {
		if(err) {
			console.log(err);
			return;
		}
		console.log("["+result.args.time.valueOf()+"]" + (result.args.added ? "Added" : "Removed") + " admin with address "+result.args.person);
	});
	
	
}

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
	
  });
}
