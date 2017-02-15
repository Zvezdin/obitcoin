import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';

import { DataTableModule, SharedModule } from 'primeng/primeng';

import 'rxjs/add/operator/switchMap';

import { Member } from './member';
import { Pool } from './pool';
import { DataService } from './data.service';

@Component({
	moduleId: module.id,
	selector: 'member-detail',
	
	templateUrl: './member-detail.component.html',
	styleUrls: ['./member-detail.component.css'],
})

export class MemberDetailComponent implements OnInit {
	member: Member;
	pools: Pool[];

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
	) {}
	
	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getMember(params['address']))
			.subscribe(member => ( member==undefined ? this.dataService.getUser().then(member => this.member = member) : this.member=member,

			this.dataService.getPools().then(pools => {
				this.pools = pools.filter( pool => pool.members.find(member2 => member2==this.member) != undefined ),
				this.initData()
			})

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pools.forEach(pool => {
			this.totalSlices=0;
			this.totalTokens=0;
			pool.members.forEach(member =>{
				if(pool.slices[member.address]!=undefined)
					this.totalSlices+=pool.slices[member.address];
				if(pool.tokens[member.address]!=undefined)
					this.totalTokens+=pool.tokens[member.address]
			});
			(pool as any).totalSlices=this.totalSlices;
			(pool as any).totalTokens=this.totalTokens;
			console.log("Total slices "+this.totalSlices+" and "+this.totalTokens);
		});
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_member', this.member.address]);
    }
}