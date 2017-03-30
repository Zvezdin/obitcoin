import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from "./core/admin/admin.component";

import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {GetMetamaskComponent} from "./get-metamask/get-metamask.component";

import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { MembersComponent } from './members/members.component';
import { MemberSearchComponent } from './member-search/member-search.component';
import { PoolDetailComponent } from './pool-detail/pool-detail.component';
import { PoolEditComponent } from './pool-edit/pool-edit.component';
import { PoolsComponent } from './pools/pools.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { IssueTokensComponent } from './issue-tokens/issue-tokens.component';
import { BuyTokensComponent } from './buy-tokens/buy-tokens.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'getMetamask',
    component: GetMetamaskComponent
  },
  {
    path: '',
    component: AdminComponent,
    
    children: [
      {
        path: 'members',
        component: MembersComponent
      },
      
      {
        path: 'dashboard',
        component: MemberDetailComponent
      },
      {
        path: 'edit_member/:id',
        component: MemberEditComponent
      },

      {
        path: 'add_member',
        component: MemberEditComponent
      },

      {
        path: 'detail_member/:id',
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
        path: 'add_pool',
        component: PoolEditComponent
      },
      {
        path: 'transactions',
        component: TransactionsComponent
      },
      {
        path: 'buy_tokens',
        component: BuyTokensComponent,
      },
      {
        path: 'issue_tokens',
        component: IssueTokensComponent,
      },
      {
        path: 'voting',
        component: VotingComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class RoutingModule { }
