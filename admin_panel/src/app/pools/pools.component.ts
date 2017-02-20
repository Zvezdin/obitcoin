import { Component } from '@angular/core';
import { Pool } from '../pool';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../data.service';

@Component({
	moduleId: module.id,
	
	selector: 'pools',
	templateUrl: './pools.component.html',
	
	styleUrls: ['./pools.component.css'],
})

export class PoolsComponent implements OnInit {
	pools: Pool[];
	
	constructor(
		private dataService: DataService,
		private router: Router,
	) {}
	
	getPools(): void {
		this.dataService.getPools().then(pools =>{
            this.pools = pools,
            this.pools.forEach(pool => pool.init());
        });
	}
	
	ngOnInit(): void {
		this.getPools();
    }
	
	onSelect(pool: Pool): void {
		this.router.navigate(['/detail_pool', pool.id]);
    }
}