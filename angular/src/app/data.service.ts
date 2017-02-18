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
		return Promise.resolve(this.members);
	}

	getPoolMembers(pool : Pool): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => pool.members.find(member2 => member2.address == member.address)));
	}

	getMembersSlowly(): Promise<Member[]> {
		return new Promise(resolve => {
			setTimeout(() => resolve(this.getMembers()), 2000);
		});
	}
	
	getMember(address: string): Promise<Member> {
		return this.getMembers()
			.then(members => members.find(member => member.address === address));
	}

	search(term: string): Promise<Member[]> {
		return this.getMembers()
			.then(members => members.filter(member => member.name.includes(term)));
	}

	getPools(): Promise<Pool[]> {
		return Promise.resolve(this.pools);
	}

	getPool(id: number): Promise<Pool> {
		return this.getPools().then(pools => pools.find(pool => pool.id == id));
	}

	getTransactions(): Promise<Transaction[]> {
		return Promise.resolve(this.transactions);
	}

	updateMember(member: Member){ //testing method
		var oldMember = this.members.find(member2 => member2.address==member.address);
		oldMember.name = member.name;
	}

	updatePool(pool: Pool){
		var oldPool = this.pools.find(pool2 => pool2.id == pool.id);
		oldPool.name = pool.name;
		oldPool.legalContract = pool.legalContract;
		oldPool.financialReports = pool.financialReports;
	}

	init(){
		this.self = this;
		this.members=MEMBERS;
		this.mockPools = new MockPools();
		//this.transactions = TRANSACTIONS;
		this.transactions = [];
		this.mockPools.init();
		this.pools=this.mockPools.getPools();

		this.contract = new contract_integration();

		this.contract.connectToContract("0xa2bfcdb45344c9544c97bfca947092d7e4676f94");
		this.contract.startListeningForEvents(this.handleEvent);
	}

	handleEvent = (event: any) => {
		console.log(event.event);

		var d = new Date(0);
		d.setUTCSeconds(event.args.time);

		var transaction = new Transaction();
		transaction.type = event.event;
		transaction.date = d.toLocaleString();

		switch(event.event){
			case "PoolCreated": {
				transaction.from = event.args.by;
				transaction.pool = event.args.index.valueOf();
			} break;

			case "CoinsTransfer": {
				transaction.from = event.args.from;
				transaction.to = event.args.to;
				transaction.pool = event.args.poolIndex;
				transaction.data = event.args.amount+" tokens";
			} break;

			case "CoinsPurchase": {
				transaction.from = event.args.from;
				transaction.pool = event.args.poolIndex;
				transaction.data = event.args.amount+" tokens";
			} break;

			case "UnauthorizedAccess": {
				transaction.from = event.args.from;
			} break;

			case "AdminChanged": {
				transaction.to = event.args.person;
				transaction.data = event.args.added ? "Admin added" : "Admin removed";
			} break;
		}

		this.transactions.push(transaction);
	}
}