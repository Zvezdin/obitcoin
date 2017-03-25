import { Injectable } from '@angular/core';

import { Member } from './member';
import { Pool } from './pool';
import { Vote } from './vote';
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
	votes: Vote[];
	transactions: Transaction[];

	notificationCallback: Function;

	dataChangeCallback: Function;

	self: any;

	lastTransactionHash: string;
	lastTransactionIndex: number;

	constructor(private contract : contractintegration) {
		this.init();
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
					if(self.membersSince[member.id]  != undefined)
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

	getVotes(forceReload: boolean = false): Promise<Vote[]> {
		var self = this;

		return new Promise(resolve => {
			this.contract.getWholeVotes(function(votes: Vote[]){
				self.votes = votes;
				resolve(self.votes);
			});
		});
	}

	getPoolVotes(pool: number): Promise<Vote[]> {
		var self = this;

		return this.getVotes().then(votes => votes.filter(vote => vote.pool == pool));
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

	delegateVote(to: number, callback: Function){
		this.contract.delegateVote(to, function(result){
			console.log("Transaction hash:"+result);
			callback(result);
		});
	}

	vote(voteIndex: number, voteFor: boolean, callback: Function){
		this.contract.vote(voteIndex, voteFor, function(result){
			console.log("Transaction hash:"+result);
			callback(result);
		});
	}

	sendTokens(pool: number, members: number[], amount: number[], callback: Function){
		this.contract.sendTokens(pool, members, amount, function(result){
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
		this.notificationCallback = undefined;
		this.members = undefined;
		this.pools = undefined;
		this.votes = undefined;
		this.lastTransactionHash = "";
		this.lastTransactionIndex = 0;
		this.transactions = [];
		this.membersSince = new Map<number, string>();
		this.dataChangeCallback = undefined;
		this.eventQueue = [];
	}

	reload =  (callback: Function) => {
		this.getMembers(true).then(members => {
			this.getPools().then(pools => {
				this.getVotes(true).then(votes => {
					console.log("Extracted contract data:", members, pools, votes);
					callback(members, pools, votes);
				});
			});
		});
	}

	deployNewContract(callback){
		var self = this;
		//this.transactions = TRANSACTIONS;
		//this.pools=this.mockPools.getPools();

		var func = function(error, address: string){
			if(error!=undefined){
				callback(error, address);
				return;
			}

			self.reload(function(){
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
				self.reload(function(){
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

	addDataChangeCallback(callback: Function){
		this.dataChangeCallback = callback;
	}

	onDataChange(){
		if(this.dataChangeCallback != undefined){
			try{
				this.dataChangeCallback();
			} catch (e) {
				this.dataChangeCallback = undefined;
				console.log("Removed callback", e);
			}
		}
	}

	eventQueue : any[];

	handleEvent = (event: any) => {
		var self = this;

		var isNew = this.contract.getLastBlockNumber() < event.blockNumber;

		var transaction;


		self.eventQueue.push(event);

		console.log("New events: ", self.eventQueue);

		if(self.lastTransactionHash == event.transactionHash){
			//self.eventQueue.push(event);
		}
		else{
			self.lastTransactionHash = event.transactionHash;

			let eventHandler : Function = function(members, pools, votes){
				for(var i = 0; i<self.eventQueue.length; i++){
					transaction = self.extractDataFromEvent(self.eventQueue[i], members, pools);
					console.log("Extracted ", self.eventQueue[i]);
					self.transactions.push(transaction);
				}
				self.eventQueue = [];
				
				var tmp = ++self.lastTransactionIndex;
				window.setTimeout(function(){
					if(tmp == self.lastTransactionIndex) self.onDataChange();
				}, 1000);
			}

			if(isNew) self.reload(eventHandler);
			else eventHandler(self.members, self.pools, self.votes);
		}

		//self.transactions.push(transaction);
	}

	extractDataFromEvent(event: any, members: Member[], pools: Pool[]) : Transaction{
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

		members.forEach(member => {
			if(member == undefined) return;
			if(member.id == Number(transaction.from)) transaction.fromName = member.name;
			if(member.id == Number(transaction.to)) transaction.toName = member.name;
		});
		pools.forEach(pool => {if(pool.id == transaction.pool) transaction.poolName = pool.name});

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

			case "VoteChanged": {
				transaction.data = "";
				var state = event.args.voteState.valueOf();

				if(state == 0) transaction.data+="Started";
				else if(state == 1) transaction.data+="Successful";
				else if(state == 2) transaction.data+="Unsuccessful";

				transaction.data += " voting at ID "+event.args.voteIndex;

				if(isNew) message = transaction.data;
			} break;

			case "Voted": {
				transaction.data = "Voted "+(event.args.vote ? "for" : "against")+" vote at ID "+event.args.voteIndex;

				if(isNew) message = transaction.fromName + " voted "+(event.args.vote ? "for" : "against")+" voting at ID "+event.args.voteIndex;
			} break;

			case "Delegation": {
				if(isNew) message = transaction.fromName +" delegated to "+transaction.toName;
			} break;
		}

		if(message != undefined && self.notificationCallback != undefined) self.notificationCallback(message);

		return transaction;
	}
}