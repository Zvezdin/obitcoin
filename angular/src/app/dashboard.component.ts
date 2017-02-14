import { Component, OnInit } from '@angular/core';

import { Member } from './member';
import { DataService } from './data.service';

@Component({
	moduleId: module.id,
	selector: 'dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
	
	members: Member[] = [];
	
	constructor(private dataService: DataService) {}
	
	ngOnInit(): void {
		this.dataService.getMembers().then(members => this.members = members.slice(1,5));
	}
}