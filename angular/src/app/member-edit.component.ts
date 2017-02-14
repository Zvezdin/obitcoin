import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { Member } from './member';
import { DataService } from './data.service';

@Component({
	moduleId: module.id,
	selector: 'member-edit',
	
	templateUrl: './member-edit.component.html',
	styleUrls: ['./member-edit.component.css'],
})

export class MemberEditComponent implements OnInit {
	member: Member;
	
	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location
	) {}
	
	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getMember(params['address']))
			.subscribe(member => this.member = member);
	}
	
	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}

	save(): void {
		this.goBack();
	}
}