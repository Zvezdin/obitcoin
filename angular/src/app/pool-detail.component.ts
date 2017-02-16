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
			this.dataService.getPoolMembers(pool).then(members => {
					this.members=members;
					this.initData();
				}
			)

		));
	}
	
	totalSlices : number;
	totalTokens: number;

	initData(){
		this.pool.init();
		this.members.forEach(member => {
			(member as any).tokens = this.pool.tokens[member.address] == undefined ? 0 : this.pool.tokens[member.address];
			(member as any).slices = this.pool.slices[member.address] == undefined ? 0 : this.pool.slices[member.address];
		});
	}

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

    edit(): void {
        this.router.navigate(['/edit_pool', this.pool.id]);
    }
}