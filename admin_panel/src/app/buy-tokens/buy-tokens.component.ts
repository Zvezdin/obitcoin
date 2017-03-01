import { Component, OnInit } from '@angular/core';
import { MdSnackBar } from "@angular/material";
import { Location } from '@angular/common';
import { DataService } from '../data.service';
import { fadeInAnimation } from '../route.animation';

import { Pool } from '../pool';


@Component({
	selector: 'ms-buy-tokens',
	templateUrl: './buy-tokens.component.html',
	styleUrls: ['./buy-tokens.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})
export class BuyTokensComponent implements OnInit {
	pools: Pool[];
	selectedPool: number;
	amount: number;

	constructor(private dataService: DataService, private snackBar: MdSnackBar, private location: Location) { }

	ngOnInit() {
		this.dataService.getPools().then(pools => this.pools = pools);
	}

	buyTokens(){
		var valid = true;

		this.amount = Math.round(this.amount);
		if(this.amount <= 0) valid = false;
		if(this.amount > Math.pow(2, 16)) valid = false;
		if(isNaN(this.amount)) valid = false;
		if(this.selectedPool == undefined) valid = false;

		if(!this.isPool(this.selectedPool)) valid = false;

		if(!valid){
			//TODO display error
			return;
		}

		console.log("Sending transaction...");

		var self = this;

		this.dataService.buyTokens(this.selectedPool, this.amount, function(result){
			if(result!=undefined){
				console.log("showing notification");
				self.snackBar.open("Sent transaction. May take up to a minute to apply.", "Close", {
				});
			}
		});
	}

	isPool(id: Number): boolean{
		return this.pools.find(pool => pool.id == id) != undefined;
	}

	back(): void {
		this.location.back();
	}
}
