import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import {fadeInAnimation} from "../route.animation";
import { MdSnackBar } from "@angular/material";

import 'rxjs/add/operator/switchMap';

import { Member } from '../member';
import { Pool } from '../pool';
import { Vote } from '../vote';
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
	votes: Vote[];
	user: Member;
	transactions: Transaction[];
	userPermissionLevel: number;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
		private cdRef: ChangeDetectorRef,
		private snackBar: MdSnackBar,
	) {
		this.dataService.addDataChangeCallback(this.onDataUpdate);
	}
	
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
						self.dataService.getPoolVotes(pool.id).then(votes => {
							self.votes = votes;
							self.dataService.getUser().then(user => {
								self.user = user;
								self.initData();
							});
						});
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
			(member as any).money = this.pool.money[member.id] == undefined ? 0 : this.pool.money[member.id];
		});

		this.dataService.getUser().then(user => user == undefined ? this.userPermissionLevel = 0 : this.userPermissionLevel = user.permissionLevel);

		try{
			this.cdRef.detectChanges();
			console.log("Detected changes");
		} catch (e) {console.log("Error while updating view", e)}
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_pool', this.pool.id]);
    }

	submitVote(vote: Vote, voteFor: boolean): void {
		console.log("Voing for ", vote, " and status ", voteFor);

		var self = this;
		
		this.dataService.vote(vote.id, voteFor, function(result){
			if(result!=undefined){
				console.log("showing notification");
				self.snackBar.open("Successfully voted.", "Close", {});
			}
		});
	}

	onDataUpdate = () => {
		this.ngOnInit();
	}
}