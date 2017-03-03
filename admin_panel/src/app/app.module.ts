import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SidenavComponent } from './core/sidenav/sidenav.component';
import { MaterialModule, MdIconRegistry } from "@angular/material";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SidenavItemComponent } from './core/sidenav-item/sidenav-item.component';
import { SidenavService } from "./core/sidenav/sidenav.service";
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface } from "angular2-perfect-scrollbar";
import { IconSidenavDirective } from './core/sidenav/icon-sidenav.directive';
import { RoutingModule } from "./app-routing.module";
import { HighlightModule } from "./core/highlightjs/highlight.module";
import { SearchComponent } from './core/search/search.component';
import { BreadcrumbsComponent } from './core/breadcrumb/breadcrumb.component';
import { BreadcrumbService } from "./core/breadcrumb/breadcrumb.service";
import { AgmCoreModule } from "angular2-google-maps/core";
import { environment } from "../environments/environment";
import { AdminComponent } from './core/admin/admin.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { GetMetamaskComponent } from './get-metamask/get-metamask.component';
import { QuillModule } from 'ngx-quill';
import { QuickpanelComponent } from './core/quickpanel/quickpanel.component';
import { LoadingOverlayComponent } from './core/loading-overlay/loading-overlay.component';
import {SortablejsModule, SortablejsOptions} from "angular-sortablejs";
import {CalendarModule} from "angular-calendar";
import {CommonModule} from "@angular/common";
import { MemberDetailsComponent } from './member-details/member-details.component';

import { DataService } from './data.service';
import { DialogService } from './dialog.service';

import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MembersComponent } from './members/members.component';
import { MemberSearchComponent } from './member-search/member-search.component';
import { PoolDetailComponent } from './pool-detail/pool-detail.component';
import { PoolEditComponent } from './pool-edit/pool-edit.component';
import { PoolsComponent } from './pools/pools.component';
import { TransactionsComponent } from './transactions/transactions.component';

import { DropdownModule, DataTableModule, SharedModule, ButtonModule, DialogModule } from 'primeng/primeng';
import { IssueTokensComponent } from './issue-tokens/issue-tokens.component';
import { BuyTokensComponent } from './buy-tokens/buy-tokens.component';
import { DialogComponent } from './dialog/dialog.component';

import { contractintegration } from './contractintegration';

const perfectScrollbarConfig: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const sortablejsConfig: SortablejsOptions = {
  animation: 300
};

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    SidenavItemComponent,
    IconSidenavDirective,
    SearchComponent,
    BreadcrumbsComponent,
    AdminComponent,
    LoginComponent,
    RegisterComponent,
    GetMetamaskComponent,
    QuickpanelComponent,
    LoadingOverlayComponent,
    MemberDetailsComponent,
    MemberDetailComponent,
    MemberEditComponent,
    MembersComponent,
    MemberSearchComponent,
    PoolDetailComponent,
    PoolEditComponent,
    PoolsComponent,
    TransactionsComponent,
    IssueTokensComponent,
    BuyTokensComponent,
    DialogComponent,
  ],
  entryComponents: [
    DialogComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    RoutingModule,
    MaterialModule.forRoot(),
    FlexLayoutModule,
    PerfectScrollbarModule.forRoot(perfectScrollbarConfig),
    AgmCoreModule.forRoot({
      apiKey: environment.googleApi
    }),
    QuillModule,
    HighlightModule,
    SortablejsModule,
    CalendarModule.forRoot(),
    DataTableModule,
		SharedModule,
		ButtonModule,
		DropdownModule,
    DialogModule,
  ],
  providers: [
    SidenavService,
    MdIconRegistry,
    BreadcrumbService,
    DataService,
    DialogService,
    contractintegration,
  ],
  bootstrap: [AppComponent],
  exports : [
    DialogModule
  ]
})
export class AppModule { }
