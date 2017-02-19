import { Component } from '@angular/core';
import { Member } from './member';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from './data.service';

@Component({
	moduleId: module.id,
	
	selector: 'members',
	templateUrl: './members.component.html',
	
	styleUrls: ['./members.component.css'],
})

export class MembersComponent implements OnInit {
	members: Member[];
	selectedMember: Member;
	
	constructor(
		private dataService: DataService,
		private router: Router,
	) {}
	
	getMembers(): void {
		this.dataService.getMembers().then(members => this.members = members);
	}
	
	ngOnInit(): void {
		this.getMembers();
	}
	
	onSelect(member: Member): void {
		this.selectedMember = member;
	}
	
	gotoDetail(): void {
		this.router.navigate(['/detail_member', this.selectedMember.id]);
	}
}