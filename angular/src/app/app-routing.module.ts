import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MemberEditComponent } from './member-edit.component';
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
		component: MemberDetailComponent
	},
	
	{
		path: '',
		redirectTo: '/dashboard',
		pathMatch: 'full'
	},
	
	{
		path: 'edit_member/:address',
		component: MemberEditComponent
	},

	{
		path: 'detail_member/:address',
		component: MemberDetailComponent
	},
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}