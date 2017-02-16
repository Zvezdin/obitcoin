"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var app_component_1 = require('./app.component');
var member_edit_component_1 = require('./member-edit.component');
var member_detail_component_1 = require('./member-detail.component');
var pool_detail_component_1 = require('./pool-detail.component');
var pool_edit_component_1 = require('./pool-edit.component');
var members_component_1 = require('./members.component');
var pools_component_1 = require('./pools.component');
var dashboard_component_1 = require('./dashboard.component');
var member_search_component_1 = require('./member-search.component');
var data_service_1 = require('./data.service');
var app_routing_module_1 = require('./app-routing.module');
var material_1 = require('@angular/material');
var primeng_1 = require('primeng/primeng');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                app_routing_module_1.AppRoutingModule,
                material_1.MaterialModule.forRoot(),
                primeng_1.DataTableModule,
                primeng_1.SharedModule,
                primeng_1.ButtonModule,
            ],
            declarations: [
                app_component_1.AppComponent,
                member_edit_component_1.MemberEditComponent,
                members_component_1.MembersComponent,
                dashboard_component_1.DashboardComponent,
                member_search_component_1.MemberSearchComponent,
                member_detail_component_1.MemberDetailComponent,
                pools_component_1.PoolsComponent,
                pool_detail_component_1.PoolDetailComponent,
                pool_edit_component_1.PoolEditComponent,
            ],
            providers: [
                data_service_1.DataService
            ],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map