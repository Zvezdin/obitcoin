import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { fadeInAnimation } from '../route.animation';

import { DataTableModule, SharedModule } from 'primeng/primeng';

import 'rxjs/add/operator/switchMap';

import { Member } from '../member';
import { Pool } from '../pool';
import { DataService } from '../data.service';

import { Transaction } from '../transaction';

@Component({
	moduleId: module.id,
	selector: 'member-detail',
	
	templateUrl: './member-detail.component.html',
	styleUrls: ['./member-detail.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class MemberDetailComponent implements OnInit {
	member: Member;
	pools: Pool[];
	transactions: Transaction[];

	userPermissionLevel: number;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
	) {}
	
	ngOnInit(): void {
		console.log(this.route.params);
		var self = this;

		this.dataService.getUser().then(user => self.userPermissionLevel = user.permissionLevel);

		this.route.params
			.switchMap((params: Params) =>
			params['id'] != undefined ? this.dataService.getMember(params['id']) : this.dataService.getUser()
		)
			.subscribe(member => (	self.member=member,

			self.dataService.getPools().then(pools => {
				self.pools = pools.filter( pool => pool.members.find(member2 => member2==self.member.id) != undefined ),
				self.dataService.getTransactionsForMember(self.member.id).then(transactions => {
					self.transactions = transactions;
					self.initData();
				});
			})

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pools.forEach(pool => {
			pool.init();
			if(pool.totalTokens>0)
				(pool as any).tokensShare = ((pool.tokens[this.member.id]/pool.totalTokens)* 100 ).toFixed(2) + "%";
			if(pool.totalSlices>0)
				(pool as any).slicesShare = ((pool.slices[this.member.id]/pool.totalSlices)* 100 ).toFixed(2) + "%";
		});
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_member', this.member.id]);
    }
}