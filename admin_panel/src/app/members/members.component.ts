import { Component } from '@angular/core';
import { Member } from '../member';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../route.animation';

import { DataService } from '../data.service';

@Component({
	moduleId: module.id,
	
	selector: 'members',
	templateUrl: './members.component.html',
	
	styleUrls: ['./members.component.scss'],

	host: {
    '[@fadeInAnimation]': 'true'
	},
	animations: [ fadeInAnimation ]
})

export class MembersComponent implements OnInit {
	members: Member[];
	userPermissionLevel: number;

	constructor(
		private dataService: DataService,
		private router: Router,
	) {}
	
	getMembers(): void {
		this.dataService.getMembers().then(members => this.members = members);
	}
	
	ngOnInit(): void {
		this.getMembers();
		this.dataService.getUser().then(user => user == undefined ? this.userPermissionLevel = 0 : this.userPermissionLevel = user.permissionLevel);
	}
	
	gotoDetail(member: Member): void {
		this.router.navigate(['/detail_member', member.id]);
	}

	addMember(): void {
		this.router.navigate(['/add_member']);
	}
}