import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { Member } from './member';
import { MemberService } from './member.service';

@Component({
	moduleId: module.id,
	selector: 'member-detail',
	
	templateUrl: './member-detail.component.html'
})

export class MemberDetailComponent implements OnInit {
	@Input()
	member: Member;
	
	constructor(
		private memberService: MemberService,
		private route: ActivatedRoute,
		private location: Location
	) {}
	
	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) =>
		this.memberService.getMember(params['address']))
			.subscribe(member => this.member = member);
	}
	
	goBack(): void {
		this.location.back(); //problematic, guard against exiting the website
	}
}