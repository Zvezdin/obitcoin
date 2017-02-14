import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
	moduleId: module.id,
	selector: 'my-app',
	template: `

	<md-sidenav-container class="navigation-container">

		<h1>{{title}}</h1>
		<button md-button (click)="sidenav.open()">Menu</button>

		<md-sidenav #sidenav class="navigation">
			<nav (click)="sidenav.close()">
				<a routerLink="/dashboard" routerLinkActive="active">
					<md-icon>account_balance_wallet</md-icon>
					<span>Dashboard</span>
				</a><br>
				<a routerLink="/members" routerLinkActive="active">
					<md-icon>people</md-icon>
					<span>Members</span>
				</a><br><a routerLink="/dashboard" routerLinkActive="active">
					<md-icon>call_split</md-icon>
					<span>Pools</span>
				</a><br><a routerLink="/dashboard" routerLinkActive="active">
					<md-icon>message</md-icon>
					<span>Transactions</span>
				</a><br>
			</nav>
		</md-sidenav>

		<router-outlet></router-outlet>
	</md-sidenav-container>
	` ,
	styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
	title = "Obitcoin";

	constructor(
		private dataService: DataService,
	) {}

	ngOnInit(){
		this.dataService.init();
	}
}