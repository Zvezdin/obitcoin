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
	membersSince: Map<number, string>
	members: Member[];
	pools: Pool[];
	transactions: Transaction[];
	mockPools: MockPools;

	accounts: string[];
	account: string;

	notificationCallback: Function;

	self: any;

	lastTransactionHash: string = "";

	constructor(private contract : contractintegration) {
		this.transactions = [];
		this.membersSince = new Map<number, string>();
	}

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
						member.init(pools);
					});
					resolve(members);
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
	
	getMember(id: number, forceReload: boolean = false): Promise<Member> {
		//console.log("Getting member with id "+id);
		return this.getMembers(forceReload)
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

	/*initData(callback){
		var self = this;
		self.getMembers(true).then(members => {
			self.contract.startListeningForEvents(self.handleEvent);
			callback();
		});
	}*/

	deployNewContract(callback){
		var self = this;
		//this.transactions = TRANSACTIONS;
		//this.pools=this.mockPools.getPools();

		var func = function(error, address: string){
			if(error!=undefined){
				callback(error, address);
				return;
			}

			self.getMembers(true).then(members => {
				self.contract.startListeningForEvents(self.handleEvent);
				callback(error, address);
			});
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
	}

	disconnect(){
		this.contract.disconnect();
	}

	setNotificationCallback(callback){
		this.notificationCallback = callback;
	}

	handleEvent = (event: any) => {
		var self = this;

		var d = new Date(0);
		d.setUTCSeconds(event.args.time);

		var transaction = new Transaction();
		transaction.type = event.event;
		transaction.date = d.toLocaleString();

		transaction.from = event.args.from;
		if(typeof event.args.to != "undefined") transaction.to = event.args.to;
		if(typeof event.args.pool != "undefined") transaction.pool = event.args.pool;

		var isNew = this.contract.getLastBlockNumber() < event.blockNumber;

		if(isNew) console.log(event);

		let message : string;

		let eventDataExtraction : Function = function(){
			self.getMembers().then(members => {
				members.forEach(member => {
					if(member == undefined) return;
					if(member.id == Number(transaction.from)) transaction.fromName = member.name;
					if(member.id == Number(transaction.to)) transaction.toName = member.name;
				});

				self.getPools().then(pools => {
					pools.forEach(pool => {if(pool.id == transaction.pool) transaction.poolName = pool.name});

					console.log("Extracting "+event.event);

					switch(event.event){
						case "PoolChanged": {
							transaction.data = event.args.added ? "Pool created" : "Pool modified";
							if(isNew) message = (event.args.added ? "Created pool " : "Modified pool ") + transaction.poolName;
						} break;

						case "PersonChanged": {
							transaction.data = event.args.added ? "Added member" : "Member modified";
							if(isNew) message = (event.args.added ? "Added " : "Modified ") + transaction.toName;

							if(event.args.added){
								var date = new Date(0);
								date.setUTCSeconds(event.args.time);
								self.membersSince[Number(event.args.to)] = date.toLocaleString();
								members.forEach(member => member.id == Number(event.args.to) ? member.memberSince = date.toLocaleString() : false);
							}
						} break;
						

						case "TokenTransfer":
						case "SliceTransfer":
						case "MoneyTransfer": {
							var units = "";
							switch(event.event){
								case "TokenTransfer": units = "tokens"; break;
								case "SliceTransfer": units = "slices"; break;
								case "MoneyTransfer": units = "money units"; break;
							}

							transaction.data = event.args.amount+" "+units;

							if(isNew){
								message = "";
								if(event.args.amount.valueOf() > 0) message +="+";
								message += event.args.amount+" "+units+" to ";
								message += transaction.toName;
								message += " in pool "+transaction.poolName;
							}
						} break;

						case "TokenPurchase": {
							transaction.data = event.args.amount+" tokens";

							if(isNew) message = "Split "+event.args.amount+" total tokens in pool "+transaction.poolName;
						} break;

						case "UnauthorizedAccess": {
							transaction.data = "From address: "+event.args.fromAddress;
							if(isNew) message = "Unauthorized access from address "+event.args.fromAddress;
						} break;

						case "AdminChanged": {
							transaction.data = event.args.added ? "Admin added" : "Admin removed";

							if(isNew) message = transaction.toName + (event.args.added ? " became an admin" : " is no longer admin");
						} break;
					}

					if(message != undefined && self.notificationCallback != undefined) self.notificationCallback(message);
				});
			});

		}

		switch(event.event){
			case "TokenTransfer":
			case "SliceTransfer":
			case "MoneyTransfer":
			case "TokenPurchase":
			case "PoolChanged":
			case "AdminChanged":
			case "PersonChanged": { //if there are any changes to the contract's state, reload everything and parse the event
				if(self.lastTransactionHash == event.transactionHash){
					console.log("Skipping data extraction due to same transaction");
					self.getMembers(isNew).then(members => eventDataExtraction()); //problematic when a newer event comes from the same transaction and the data loading is not completed
				} else {
					self.lastTransactionHash = event.transactionHash;
					self.getMembers(isNew).then(members => eventDataExtraction());
				}
			} break;
			default: { //if no changes are commited, then just parse the event
				eventDataExtraction();
			} break;
		}

		self.transactions.push(transaction);
	}
}