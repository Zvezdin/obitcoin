import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { fadeInAnimation } from '../route.animation';
import { MdSnackBar } from "@angular/material";

import 'rxjs/add/operator/switchMap';

import { Pool } from '../pool';
import { DataService } from '../data.service';

@Component({
	moduleId: module.id,
	selector: 'pool-edit',
	
	templateUrl: './pool-edit.component.html',
	styleUrls: ['./pool-edit.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class PoolEditComponent implements OnInit {
	pool: Pool;
	title: string;
	creatingPool: boolean;

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
		private snackBar: MdSnackBar,
	) {}
	
	ngOnInit(): void {
        this.pool = new Pool();

		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getPool(params['id']))
			.subscribe(pool => this.setPool(pool));
	}
	
    setPool(pool: Pool): void { //clone the object so we can modify a local copy, and then apply the changes to the main database
		if(pool!=undefined){
			this.pool.id = pool.id;
			this.pool.name = pool.name;
			this.pool.legalContract = pool.legalContract;
			this.pool.financialReports = pool.financialReports;
			this.title = pool.name;
			this.creatingPool = false;
		} else {
			this.creatingPool = true;
			this.title = "Add debt pool";
		}
    }

	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

	save(): void {
		var self = this;
        this.pool.name = this.pool.name.trim(); //error checking
        this.pool.legalContract = this.pool.legalContract.trim();
        this.pool.financialReports = this.pool.financialReports.trim();

        if(this.pool.name.length<=0) return;
        if(this.pool.legalContract.length<=0) return;
        if(this.pool.financialReports.length<=0) return;

		this.applyChanges(function(result){
			if(result!=undefined){
				console.log("showing notification");
				self.snackBar.open("Submitted changes. May take up to a minute to apply.", "Close", {
					duration: 5000
				});
			}
		});
	}

	applyChanges(callback): void {
		if(this.creatingPool){
			this.dataService.addPool(this.pool.name, this.pool.legalContract, this.pool.financialReports, callback);
		} else this.dataService.updatePool(this.pool, callback);
	}
}