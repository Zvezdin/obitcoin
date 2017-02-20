import { Injectable } from '@angular/core';

import { Member } from './member';
import { Pool } from './pool';
import { Transaction } from './transaction';
import { MEMBERS } from './mock-members';
import { TRANSACTIONS } from './mock-transactions';
import { MockPools } from './mock-pools';

//import 'app/contract_integration.js';

//declare var contract_integration: any;

declare var contract_integration: any;

@Injectable()

export class DataService {
	contract: any;

	members: Member[];
	pools: Pool[];
	transactions: Transaction[];
	mockPools: MockPools;

	accounts: string[];
	account: string;

	self: any;

	getUser(): Promise<Member> {

		return Promise.resolve(this.members[0]);
	}

	getMembers(): Promise<Member[]> {
		if(this.members!=undefined) return Promise.resolve(this.members); //return the cached version

		return new Promise(resolve => { //get the data the slow way
			var self = this;
			this.contract.getWholeMembers(function(members: any[]){
				self.members = members;
				resolve(members);
			});
		});
	}

	getPoolMembers(pool : Pool): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => pool.members.find(member2 => member2.id == member.id)));
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

	getPools (): Promise<Pool[]> {
		if(this.pools!=undefined) return Promise.resolve(this.pools);
		var self = this;

		return new Promise(resolve => {
			this.contract.getWholePools(function(pools: any[]){
				self.pools = [];
				pools.forEach(pool => {
					var newPool = new Pool();
					newPool.id = pool.id;
					newPool.financialReports = pool.financialReports;
					newPool.legalContract = pool.legalContract;
					newPool.name = pool.name;
					newPool.slices = pool.slices;
					newPool.tokens = pool.tokens;
					newPool.members = [];

					var members = pool.members;
					members.forEach(function(id: number){
						self.getMember(id).then(function(member: Member){
							newPool.members.push(member);
						});
					});

					self.pools.push(newPool);
				});
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

	updateMember(member: Member){ //testing method
		var oldMember = this.members.find(member2 => member2.id==member.id);
		oldMember.name = member.name;
		oldMember.address = member.address;
	}

	updatePool(pool: Pool){
		var oldPool = this.pools.find(pool2 => pool2.id == pool.id);
		oldPool.name = pool.name;
		oldPool.legalContract = pool.legalContract;
		oldPool.financialReports = pool.financialReports;
	}

	init(){
		this.self = this;
		this.mockPools = new MockPools();
		//this.transactions = TRANSACTIONS;
		this.transactions = [];
		this.mockPools.init();
		//this.pools=this.mockPools.getPools();

		this.contract = new contract_integration();

		this.contract.connectToContract("0xad2b2b39f0e1048ebee657bba379011cbe5523f5");
		this.contract.startListeningForEvents(this.handleEvent);

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

	handlePools = (pools: any[], callback: any) => {
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
			newPool.members = [];

			var members = pool.members;
			members.forEach(function(id: number){
				self.getMember(id).then(function(member: Member){
					newPool.members.push(member);
				});
			});

			self.pools.push(newPool);
		});

		callback(this.pools);
	}

	handleMembers = (members: any[]) => {
		this.members=members;
	}

	handleEvent = (event: any) => {
		console.log(event.event);

		var d = new Date(0);
		d.setUTCSeconds(event.args.time);

		var transaction = new Transaction();
		transaction.type = event.event;
		transaction.date = d.toLocaleString();

		transaction.from = event.args.from;

		switch(event.event){
			case "PoolCreated": {
				transaction.pool = event.args.pool;
			} break;

			case "CoinsTransfer": {
				transaction.to = event.args.to;
				transaction.pool = event.args.pool;
				transaction.data = event.args.amount+" tokens";
			} break;

			case "CoinsPurchase": {
				transaction.pool = event.args.pool;
				transaction.data = event.args.amount+" tokens";
			} break;

			case "UnauthorizedAccess": {
				transaction.data = "from address: "+event.args.fromAddress;
			} break;

			case "AdminChanged": {
				transaction.to = event.args.person;
				transaction.data = event.args.added ? "Admin added" : "Admin removed";
			} break;
		}

		this.transactions.push(transaction);
	}
}