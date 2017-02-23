import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { fadeInAnimation } from '../route.animation';
import { MdSnackBar } from "@angular/material";

import 'rxjs/add/operator/switchMap';

import { Member } from '../member';
import { DataService } from '../data.service';

@Component({
	moduleId: module.id,
	selector: 'member-edit',
	
	templateUrl: './member-edit.component.html',
	styleUrls: ['./member-edit.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class MemberEditComponent implements OnInit {
	member: Member;
	memberAddress: string;
	title: string;
	creatingMember: boolean;
	constructor(
		private dataService: DataService,
		private route: ActivatedRoute,
		private location: Location,
		private snackBar: MdSnackBar,
	) {}
	
	ngOnInit(): void {
		this.member = new Member();
		this.route.params
			.switchMap((params: Params) =>
		this.dataService.getMember(params['id']))
			.subscribe(member => this.setMember(member));
	}
	
	setMember(member: Member): void {
		//console.log(member.name.length);
		if(member!=undefined){
			this.member.address = member.address;
			this.member.name = member.name;
			this.member.id = member.id;
			this.member.permissionLevel = member.permissionLevel;
			this.title = member.name;
			this.creatingMember = false;
		} else{
			this.member.permissionLevel = 1;
			this.title = "Add member";
			this.creatingMember = true;
		}
	}

	goBack(): void {
		console.log(this.memberAddress);
		this.location.back(); //problematic, guard against exiting the website
	}

	save(): void {
		var self = this;
		this.member.address = this.member.address.trim();
		this.member.name = this.member.name.trim();
		if(this.member.address.length<=0) return;
		if(this.member.name.length<=0) return;

		this.applyChanges(function(result){
			if(result!=undefined){
				self.snackBar.open("Submitted changes. May take up to a minute to apply.", "Close", {
					duration: 5000
				});
			}
		});
	}

	applyChanges(callback): void {
		if(this.creatingMember){
			this.dataService.addMember(this.member.name, this.member.address, this.member.permissionLevel == 2, callback);
		} else this.dataService.updateMember(this.member, callback);
	}
}