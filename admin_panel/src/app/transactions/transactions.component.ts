import { Component } from '@angular/core';
import { Transaction } from '../transaction';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../route.animation';

import { DataService } from '../data.service';

import { SelectItem} from 'primeng/primeng';

@Component({
	moduleId: module.id,
	
	selector: 'transactions',
	templateUrl: './transactions.component.html',
	
	styleUrls: ['./transactions.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class TransactionsComponent implements OnInit {
    transactions: Transaction[];
	pools: SelectItem[];
	userPermissionLevel: number;

	constructor(
		private dataService: DataService,
		private router: Router,
	) {}
	
	getTransactions(): void {
		this.dataService.getTransactions().then(transactions =>
		{
            this.transactions = transactions;
		});
	}

	ngOnInit(): void {
		this.pools = [];

		this.getTransactions();
		this.pools.push({label: "All pools", value: null});
		this.dataService.getPools().then(pools => pools.forEach(pool => this.pools.push({label: pool.name, value: pool.name})));
		this.dataService.getUser().then(user => user == undefined ? this.userPermissionLevel = 0 : this.userPermissionLevel = user.permissionLevel);
    }

	sendTokens(): void {
		this.router.navigate(['/issue_tokens']);
	}

	buyTokens(): void {
		this.router.navigate(['/buy_tokens']);
	}
}