import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';
import { MemberEditComponent } from './member-edit.component';
import { MemberDetailComponent } from './member-detail.component';
import { MembersComponent } from './members.component';
import { DashboardComponent } from './dashboard.component';
import { MemberSearchComponent } from './member-search.component';
import { DataService } from './data.service';

import { AppRoutingModule } from './app-routing.module';

import { MaterialModule } from '@angular/material';

@NgModule({
	imports: [ 
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		MaterialModule.forRoot(),
	],
	declarations: [ 
		AppComponent,
		MemberEditComponent,
		MembersComponent,
		DashboardComponent,
		MemberSearchComponent,
		MemberDetailComponent,
	],
	providers: [
		DataService
	],
	
	bootstrap: [ AppComponent ]
	
})
export class AppModule { }
