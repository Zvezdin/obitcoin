import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { MdSnackBar } from "@angular/material";
import { Location } from '@angular/common';
import { fadeInAnimation } from '../route.animation';

import { Pool } from '../pool';
import { Member } from '../member';

@Component({
	selector: 'ms-issue-tokens',
	templateUrl: './issue-tokens.component.html',
	styleUrls: ['./issue-tokens.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})
export class IssueTokensComponent implements OnInit {
	pools: Pool[];
	members: Member[];
	inputs: Input[];
	pool: number;

	constructor(private dataService: DataService, private snackBar: MdSnackBar, private location: Location) { }

	ngOnInit() {
		var self = this;

		self.inputs = [];

		self.newInput();

		this.dataService.getMembers().then(members => {
			self.members = members;

			self.dataService.getPools().then(pools => {
				self.pools = pools;
			});
		});
	}

	newInput(): void {
		this.inputs.push(new Input());
	}

	remove(input: Input){
		var index = this.inputs.indexOf(input);
		if(index>=0)
			this.inputs.splice(index, 1);
	}

	issueTokens(): void {
		var valid = true;

		var pools = [];
		var members = [];
		var amount = [];

		if(this.pool == undefined) valid = false;
		if(!this.isPool(this.pool)) valid = false;

		this.inputs.forEach(input => { //check the input for validity. It is extremely important to have everything valid for a successful transaciton
			input.amount = Math.round(input.amount);
			if(input.amount <= 0) valid = false;
			if(input.amount > Math.pow(2, 16)) valid = false;
			if(isNaN(input.amount)) valid = false;
			if(input.member == undefined) valid = false;
			if(this.pool == undefined) valid = false;

			if(!this.isMember(input.member)) valid = false;

			members.push(input.member);
			amount.push(input.amount);
		});

		if(!valid){
			//TODO display error
			return;
		}

		console.log("Sending bulk transaction...");

		var self = this;

		this.dataService.sendTokens(this.pool, members, amount, function(result){
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

	isMember(id: Number): boolean{
		return this.members.find(member => member.id == id) != undefined;
	}

	back(): void {
		this.location.back();
	}

}

class Input {
	member: number;
	amount: number;
}
