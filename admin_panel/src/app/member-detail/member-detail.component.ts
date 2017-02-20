import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';

import { DataTableModule, SharedModule } from 'primeng/primeng';

import 'rxjs/add/operator/switchMap';

import { Member } from '../member';
import { Pool } from '../pool';
import { DataService } from '../data.service';

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
		this.dataService.getMember(params['id']))
			.subscribe(member => ( member==undefined ? this.dataService.getUser().then(member => this.member = member) : this.member=member,

			this.dataService.getPools().then(pools => {
				console.log(pools[0].members[0]);
				console.log(this.member);
				this.pools = pools.filter( pool => pool.members.find(member2 => member2==this.member.id) != undefined ),
				this.initData()
			})

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pools.forEach(pool => {
			pool.init();
			(pool as any).tokensShare = ((pool.tokens[this.member.id]/pool.totalTokens)* 100 ).toFixed(2) + "%";
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