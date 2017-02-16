import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';
import { MemberEditComponent } from './member-edit.component';
import { MemberDetailComponent } from './member-detail.component';
import { PoolDetailComponent } from './pool-detail.component';
import { PoolEditComponent } from './pool-edit.component';
import { MembersComponent } from './members.component';
import { PoolsComponent } from './pools.component';
import { DashboardComponent } from './dashboard.component';
import { MemberSearchComponent } from './member-search.component';
import { DataService } from './data.service';

import { AppRoutingModule } from './app-routing.module';

import { MaterialModule } from '@angular/material';

import { DataTableModule, SharedModule, ButtonModule } from 'primeng/primeng';

@NgModule({
	imports: [ 
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		MaterialModule.forRoot(),
		DataTableModule,
		SharedModule,
		ButtonModule,
	],
	declarations: [ 
		AppComponent,
		MemberEditComponent,
		MembersComponent,
		DashboardComponent,
		MemberSearchComponent,
		MemberDetailComponent,
		PoolsComponent,
		PoolDetailComponent,
		PoolEditComponent,
	],
	providers: [
		DataService
	],
	
	bootstrap: [ AppComponent ]
	
})
export class AppModule { }
