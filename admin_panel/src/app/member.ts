import { Pool } from './pool';

export class Member {
	id: number;
	name: string;
	address: string;
	permissionLevel: number;
	memberSince: string = "unknown";
	totalTokens: number;
	totalSlices: number;
	totalMoney: number;
	delegateTo: number;

	init(pools: Pool[]){
		this.totalTokens = 0;
		this.totalSlices = 0;
		this.totalMoney = 0;

		pools.forEach(pool =>{
			if(pool.tokens[this.id]!=undefined) this.totalTokens += pool.tokens[this.id];
			if(pool.slices[this.id]!=undefined) this.totalSlices += pool.slices[this.id];
			if(pool.money[this.id]!=undefined) this.totalMoney += pool.money[this.id];
		});
	}
}