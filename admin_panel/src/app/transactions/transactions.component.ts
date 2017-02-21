import { Component } from '@angular/core';
import { Transaction } from '../transaction';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../data.service';

import { SelectItem} from 'primeng/primeng';

@Component({
	moduleId: module.id,
	
	selector: 'transactions',
	templateUrl: './transactions.component.html',
	
	styleUrls: ['./transactions.component.scss'],
})

export class TransactionsComponent implements OnInit {
    transactions: Transaction[];
	pools: SelectItem[];

	constructor(
		private dataService: DataService,
		private router: Router,
	) {}
	
	getTransactions(): void {
		this.dataService.getTransactions().then(transactions =>
		{
            this.transactions = transactions;
			this.prepareData();
		});
	}
	
	prepareData(){
		this.transactions.forEach(transaction => this.dataService.getPool(transaction.pool)
		.then(pool => 
		{
			if(pool!=undefined) (transaction as any).poolName = pool.name
		}
		));
	}

	ngOnInit(): void {
		this.pools = [];

		this.getTransactions();
		this.pools.push({label: "All pools", value: null});
		this.dataService.getPools().then(pools => pools.forEach(pool => this.pools.push({label: pool.name, value: pool.name})));
    }
}