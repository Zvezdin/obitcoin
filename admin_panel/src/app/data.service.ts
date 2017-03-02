import { Injectable } from '@angular/core';

import { Member } from './member';
import { Pool } from './pool';
import { Transaction } from './transaction';
import { MEMBERS } from './mock-members';
import { TRANSACTIONS } from './mock-transactions';
import { MockPools } from './mock-pools';

import { contractintegration } from './contractintegration';
//import * as contract_integration from './contractintegration';
//import 'app/contract_integration.js';

//declare var contract_integration: any;

//declare var contract_integration: any;

@Injectable()

export class DataService {
	contract: any;

	membersSince: Map<number, string>
	members: Member[];
	pools: Pool[];
	transactions: Transaction[];
	mockPools: MockPools;

	accounts: string[];
	account: string;

	notificationCallback: Function;

	self: any;



	getUser(): Promise<Member> {

		return this.getMembers().then(members => members.find(member => member.address == this.contract.getAccount()));
	}

	getMembers(forceReload: boolean = false): Promise<Member[]> {
		if(this.members!=undefined && !forceReload) return Promise.resolve(this.members); //return the cached version

		return new Promise(resolve => { //get the data the slow way
			var self = this;
			this.contract.getWholeMembers(function(members: Member[]){
				self.members = members;

				self.members.forEach(member => {
					member.memberSince = self.membersSince[member.id];
				});

				self.getPools(forceReload).then(pools => {
					members.forEach(member => {
						member.totalTokens = 0;
						member.totalSlices = 0;

						pools.forEach(pool =>{
							if(pool.tokens[member.id]!=undefined) member.totalTokens += pool.tokens[member.id];
							if(pool.slices[member.id]!=undefined) member.totalSlices += pool.slices[member.id];
						});
						
						console.log("Loaded member: ", member);

						resolve(members);
					});
				});
			});
		});
	}

	getPoolMembers(pool : Pool): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => pool.members.find(member2 => member2 == member.id)));
	}

	getMembersSlowly(): Promise<Member[]> {
		return new Promise(resolve => {
			setTimeout(() => resolve(this.getMembers()), 2000);
		});
	}
	
	getMember(id: number): Promise<Member> {
		console.log("Getting member with id "+id);
		return this.getMembers()
			.then(members => members.find(member => member.id == id));
	}

	search(term: string): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => member.name.includes(term)));
	}

	getPools (forceReload: boolean = false): Promise<Pool[]> {
		if(this.pools!=undefined && !forceReload) return Promise.resolve(this.pools);
		var self = this;

		return new Promise(resolve => {
			this.contract.getWholePools(function(pools: Pool[]){
				self.pools = pools;
				/*pools.forEach(pool => {
					var newPool = new Pool();
					newPool.id = pool.id;
					newPool.financialReports = pool.financialReports;
					newPool.legalContract = pool.legalContract;
					newPool.name = pool.name;
					newPool.slices = pool.slices;
					newPool.tokens = pool.tokens;
					newPool.members = pool.members;

					self.pools.push(newPool);
					console.log("Loading pool: ", newPool);
				});*/
				console.log("Loaded pools: ", pools);
				resolve(self.pools);
			});
		});
	}

	getPool(id: number): Promise<Pool> {
		return this.getPools().then(pools => pools.find(pool => pool.id == id));
	}

	getTransactions(): Promise<Transaction[]> {
		return Promise.resolve(this.transactions);
	}

	getTransactionsForPool(pool: number): Promise<Transaction[]>{
		return this.getTransactions().then(transactions => transactions.filter(transaction => transaction.pool == pool));
	}

	getTransactionsForMember(member: number): Promise<Transaction[]>{
		return this.getTransactions().then(transactions => transactions.filter(transaction => Number(transaction.from) == member || Number(transaction.to) == member));
	}

	isConnected(): boolean {
		return this.contract.isConnected();
	}

	isWeb3Available(): boolean {
		return this.contract.isWeb3Available();
	}

	updateMember(member: Member, callback: Function){
		this.contract.updateMember(member.id, member.name, member.address, member.permissionLevel == 2 ? true : false, function(result){
			console.log("Transaction hash:"+result);

			callback(result);
		});
	}

	updatePool(pool: Pool, callback: Function){
		this.contract.updatePool(pool.id, pool.name, pool.financialReports, pool.legalContract, function(result){
			console.log("Transaction hash:"+result);

			callback(result);
		});
	}

	addMember(name: string, address: string, isAdmin: boolean, callback: Function){
		this.contract.addMember(name, address, isAdmin, function(result){
			console.log("Transaction hash:"+result);

			callback(result);
		});
	}

	addPool(name: string, legalContract: string, financialReports: string, callback: Function){
		this.contract.createDebtPool(name, legalContract, financialReports, function(result){
			console.log("Transaction hash:"+result);

			callback(result);
		});
	}

	sendTokens(pools: number[], members: number[], amount: number[], callback){
		this.contract.sendTokensBulk(pools, members, amount, function(result){
			console.log("Transaction hash:"+result);
			callback(result);
		});
	}

	buyTokens(pool: number, amount: number, callback){
		this.contract.buyTokens(pool, amount, function(result){
			console.log("Transaction hash:"+result);
			callback(result);
		});
	}

	init(){
		console.log(typeof contractintegration);
		this.contract = new contractintegration();
		this.transactions = [];
		this.membersSince = new Map<number, string>();
	}

	initData(callback){
		var self = this;
		self.getMembers(true).then(members => {
			self.contract.startListeningForEvents(self.handleEvent);
			callback();
		});
	}

	deployNewContract(callback){
		var self = this;
		//this.transactions = TRANSACTIONS;
		//this.pools=this.mockPools.getPools();

		var func = function(error: string, address: string){
			if(error!=undefined){
				callback(error, address);
				return;
			}

			callback(error, address);
		};

		this.contract.init(function(error: string){
			if(error==undefined){
				self.contract.deployNewContract(func);
			} else callback(error, undefined);
		})

	}

	connectToContract(contractAddress: string, callback){
		var self = this;
		//this.transactions = TRANSACTIONS;
		//this.pools=this.mockPools.getPools();

		var func = function(error: string, address: string){
			if(error!=undefined){
				callback(error, address);
				return;
			} else {
				self.getMembers(true).then(members => {
					self.contract.startListeningForEvents(self.handleEvent);
					callback(error, address);
				});
			}
		};

		this.contract.init(function(error: string){
			if(error==undefined){
				self.contract.connectToContract(contractAddress, func);
			} else callback(error, undefined);
		});

		//this.getMembers().then(members => this.contract.startListeningForEvents(this.handleEvent));

		/*this.contract.getPools();
		this.contract.getPoolData(1);
		this.contract.getPoolParticipants(1);
		this.contract.getMemberBalance(1,1);
		this.contract.getWhileMembers();
		this.contract.getMemberName(1);
		this.contract.getMemberAddress(1);
		this.contract.getMemberPermLevel(1);*/
		
		//this.contract.getWholeMembers(this.handleMembers);
		//this.contract.getWholePools(this.handlePools);
	}

	setNotificationCallback(callback){
		this.notificationCallback = callback;
	}

	handlePools = (pools: Pool[], callback: any) => {
		var self = this;
		this.pools = [];
		pools.forEach(pool => {
			var newPool = new Pool();
			newPool.id = pool.id;
			newPool.financialReports = pool.financialReports;
			newPool.legalContract = pool.legalContract;
			newPool.name = pool.name;
			newPool.slices = pool.slices;
			newPool.tokens = pool.tokens;
			newPool.members = pool.members;

			/*var members = pool.members;
			members.forEach(function(id: number){
				self.getMember(id).then(function(member: Member){
					newPool.members.push(member);
				});
			});*/

			self.pools.push(newPool);
		});

		callback(this.pools);
	}

	handleMembers = (members: any[]) => {
		this.members=members;
	}

	handleEvent = (event: any) => {
		console.log(event.event);
		console.log(event);

		var self = this;

		var d = new Date(0);
		d.setUTCSeconds(event.args.time);

		var transaction = new Transaction();
		transaction.type = event.event;
		transaction.date = d.toLocaleString();

		transaction.from = event.args.from;

		var isNew = this.contract.getLastBlockNumber() < event.blockNumber;

		console.log(isNew, this.contract.getLastBlockNumber(), event.blockNumber);

		if(isNew){
			if(this.notificationCallback!=undefined) this.notificationCallback("New event: "+event.event);
		}

		switch(event.event){
			case "PoolChanged": {
				transaction.pool = event.args.pool;
				transaction.data = event.args.added ? "Pool created" : "Pool modified";

				if(isNew) this.getPools(true);
			} break;

			case "PersonChanged": {
				transaction.to = event.args.to;
				transaction.data = event.args.added ? "Added member" : "Member modified";
				
					if(event.args.added){
						var date = new Date(0);
						date.setUTCSeconds(event.args.time);
						self.membersSince[Number(event.args.to)] = date.toLocaleString();

						if(isNew) self.getMembers(true);
						else self.getMember(Number(event.args.to)).then(member => member.memberSince = date.toLocaleString());
					}

			} break;
			

			case "TokenTransfer": {
				transaction.to = event.args.to;
				transaction.pool = event.args.pool;
				transaction.data = event.args.amount+" tokens";

				if(isNew) this.getMembers(true);
			} break;

			case "SliceTransfer": {
				transaction.to = event.args.to;
				transaction.pool = event.args.pool;
				transaction.data = event.args.amount+" tokens";

				if(isNew) this.getMembers(true);
			} break;

			case "TokenPurchase": {
				transaction.pool = event.args.pool;
				transaction.data = event.args.amount+" tokens";

				if(isNew) this.getMembers(true);
			} break;

			case "UnauthorizedAccess": {
				transaction.data = "From address: "+event.args.fromAddress;
			} break;

			case "AdminChanged": {
				transaction.to = event.args.person;
				transaction.data = event.args.added ? "Admin added" : "Admin removed";
			} break;
		}

		this.getMember(Number(transaction.from)).then(member => {
			if(member!=undefined) transaction.fromName = member.name
		});

		if(transaction.to!=undefined){
			this.getMember(Number(transaction.to)).then(member => {
				if(member!=undefined) transaction.toName = member.name
			});
		}

		this.transactions.push(transaction);
	}
}