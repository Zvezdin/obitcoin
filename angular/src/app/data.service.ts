import { Injectable } from '@angular/core';

import { Member } from './member';
import { Pool } from './pool';
import { Transaction } from './transaction';
import { MEMBERS } from './mock-members';
import { MockPools } from './mock-pools';

@Injectable()

export class DataService {
	members: Member[];
	pools: Pool[];
	transactions: Transaction;
	mockPools: MockPools;

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
		this.members=MEMBERS;
		this.mockPools = new MockPools();
		this.mockPools.init();
		this.pools=this.mockPools.getPools();
	}
}