import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';
import { MemberDetailComponent } from './member-detail.component';
import { MembersComponent } from './members.component';
import { DashboardComponent } from './dashboard.component';
import { MemberSearchComponent } from './member-search.component';
import { MemberService } from './member.service';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
	imports: [ 
		BrowserModule,
		FormsModule,
		AppRoutingModule
	],
	declarations: [ 
		AppComponent,
		MemberDetailComponent,
		MembersComponent,
		DashboardComponent,
		MemberSearchComponent
	],
	providers: [
		MemberService
	],
	
	bootstrap: [ AppComponent ]
	
})
export class AppModule { }
