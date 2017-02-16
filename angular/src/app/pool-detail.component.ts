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
	selector: 'pool-detail',
	
	templateUrl: './pool-detail.component.html',
	styleUrls: ['./pool-detail.component.css'],
})

export class PoolDetailComponent implements OnInit {
	members: Member[];
	pool : Pool;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
        private router: Router,
	) {}
	
	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getPool(params['id']))
			.subscribe(pool => ( this.pool=pool,

			this.dataService.getMembers().then(pools => {
				this.pools = pools.filter( pool => pool.members.find(member2 => member2==this.member) != undefined ),
				this.initData()
			})

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pools.forEach(pool => {
			pool.init();
			(pool as any).tokensShare = ((pool.tokens[this.member.address]/pool.totalTokens)* 100 ).toFixed(2) + "%";
			(pool as any).slicesShare = ((pool.slices[this.member.address]/pool.totalSlices)* 100 ).toFixed(2) + "%";;
		});
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_member', this.member.address]);
    }
}