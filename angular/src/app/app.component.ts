import { Component } from '@angular/core';

@Component({
	moduleId: module.id,
	selector: 'my-app',
	template: `

	<md-sidenav-container class="navigation-container">

		<h1>{{title}}</h1>
		<button md-button (click)="sidenav.open()">Menu</button>

		<md-sidenav #sidenav class="navigation">
			<nav>
				<a routerLink="/dashboard" routerLinkActive="active">
					<md-icon>dialpad</md-icon>
					<span>Dashboard</span>
				</a><br>
				<a routerLink="/members" routerLinkActive="active">Members</a><br>
				<a routerLink="/dashboard" routerLinkActive="active">Pools</a><br>
				<a routerLink="/members" routerLinkActive="active">Transactions</a><br>
			</nav>
		</md-sidenav>

		<router-outlet></router-outlet>
	</md-sidenav-container>
	` ,
	styleUrls: ['./app.component.css'],
})

export class AppComponent {
	title = "Obitcoin";
}