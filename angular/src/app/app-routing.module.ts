import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MemberEditComponent } from './member-edit.component';
import { MemberDetailComponent } from './member-detail.component';
import { PoolDetailComponent } from './pool-detail.component';
import { PoolEditComponent } from './pool-edit.component';
import { MembersComponent } from './members.component';
import { PoolsComponent } from './pools.component';
import { DashboardComponent } from './dashboard.component';
import { TransactionsComponent } from './transactions.component';

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

	{
		path: 'pools',
		component: PoolsComponent
	},

	{
		path: 'detail_pool/:id',
		component: PoolDetailComponent
	},

	{
		path: 'edit_pool/:id',
		component: PoolEditComponent
	},

	{
		path: 'transactions',
		component: TransactionsComponent
	},
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}