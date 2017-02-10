import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MemberDetailComponent } from './member-detail.component';
import { MembersComponent } from './members.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
	{
		path: 'members',
		component: MembersComponent
	},
	
	{
		path: 'dashboard',
		component: DashboardComponent
	},
	
	{
		path: '',
		redirectTo: '/dashboard',
		pathMatch: 'full'
	},
	
	{
		path: 'detail/:address',
		component: MemberDetailComponent
	}
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}