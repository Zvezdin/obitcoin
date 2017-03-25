import { Component, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { fadeInAnimation } from '../route.animation';
import { MdSnackBar } from "@angular/material";

import { DataTableModule, SharedModule } from 'primeng/primeng';
import { SelectItem} from 'primeng/primeng';

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
	animations: [ fadeInAnimation ],
})

export class MemberDetailComponent implements OnInit {
	member: Member;
	pools: Pool[];
	poolLabels: SelectItem[];
	transactions: Transaction[];

	user: Member;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
		private cdRef: ChangeDetectorRef,
		private appRef: ApplicationRef,
		private snackBar: MdSnackBar,
	) {
		this.dataService.addDataChangeCallback(this.onDataUpdate);
	}
	
	ngOnInit(): void {
		var self = this;

		this.dataService.getUser().then(user => self.user = user);

		this.route.params
			.switchMap((params: Params) =>
			params['id'] != undefined ? this.dataService.getMember(params['id']) : this.dataService.getUser()
		)
			.subscribe(member => {	self.member=member;
			if(member==undefined) return;
			self.dataService.getPools().then(pools => {
				self.pools = pools.filter( pool => pool.members.find(member2 => member2==self.member.id) != undefined );
				self.dataService.getTransactionsForMember(self.member.id).then(transactions => {
					self.transactions = transactions;
					self.initData();
				});
			})

		});
	}
	
	ngAfterViewInit() {
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 1000);
	}

	totalSlices : number;
	totalTokens: number;

	initData(){
		this.poolLabels = [];
		this.poolLabels.push({label: "All pools", value: null});
		this.pools.forEach(pool => {
			this.poolLabels.push({label: pool.name, value: pool.name})
			pool.init();
			if(pool.totalTokens>0)
				(pool as any).tokensShare = ((pool.tokens[this.member.id]/pool.totalTokens)* 100 ).toFixed(2) + "%";
			if(pool.totalSlices>0)
				(pool as any).slicesShare = ((pool.slices[this.member.id]/pool.totalSlices)* 100 ).toFixed(2) + "%";
			if(pool.totalMoney>0)
				(pool as any).moneyShare = ((pool.money[this.member.id]/pool.totalMoney)* 100 ).toFixed(2) + "%";
		});
		try{
			this.cdRef.detectChanges();
			console.log("Detected changes");
		} catch (e) {console.log("Error while updating view", e)}
	}

	onDataUpdate = () => {
		this.ngOnInit();
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_member', this.member.id]);
    }

	delegate(): void {
		if(this.user == undefined || this.user.id == this.member.id) return;
		var instance = this;
		this.dataService.delegateVote(this.member.id, function(result){
			if(result!=undefined){
				instance.snackBar.open("Submitted changes. May take up to a minute to apply.", "Close", {});
			}
		});
	}
}