import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import {fadeInAnimation} from "../route.animation";

import 'rxjs/add/operator/switchMap';

import { Member } from '../member';
import { Pool } from '../pool';
import { DataService } from '../data.service';
import { Transaction } from '../transaction';

@Component({
	moduleId: module.id,
	selector: 'pool-detail',
	
	templateUrl: './pool-detail.component.html',
	styleUrls: ['./pool-detail.component.scss'],

	host: {
		'[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class PoolDetailComponent implements OnInit {
	members: Member[];
	pool : Pool;
	transactions: Transaction[];
	userPermissionLevel: number;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
	) {}
	
	ngOnInit(): void {
		var self = this;

		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getPool(params['id']))
			.subscribe(pool => ( self.pool=pool,
			self.dataService.getPoolMembers(pool).then(members => {
					self.members=members;
					self.dataService.getTransactionsForPool(pool.id).then(transactions => {
						self.transactions = transactions;
						self.initData();
					});
				}
			)

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pool.init();
		this.members.forEach(member => {
			(member as any).tokens = this.pool.tokens[member.id] == undefined ? 0 : this.pool.tokens[member.id];
			(member as any).slices = this.pool.slices[member.id] == undefined ? 0 : this.pool.slices[member.id];
		});

		this.dataService.getUser().then(user => this.userPermissionLevel = user.permissionLevel);
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_pool', this.pool.id]);
    }
}