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
var data_service_1 = require('./data.service');
var AppComponent = (function () {
    function AppComponent(dataService) {
        this.dataService = dataService;
        this.title = "Obitcoin";
    }
    AppComponent.prototype.ngOnInit = function () {
        this.dataService.init();
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-app',
            template: "\n\n\t<md-sidenav-container class=\"navigation-container\">\n\n\t\t<h1>{{title}}</h1>\n\t\t<button md-button (click)=\"sidenav.open()\">Menu</button>\n\n\t\t<md-sidenav #sidenav class=\"navigation\">\n\t\t\t<nav (click)=\"sidenav.close()\">\n\t\t\t\t<a routerLink=\"/dashboard\" routerLinkActive=\"active\">\n\t\t\t\t\t<md-icon>account_balance_wallet</md-icon>\n\t\t\t\t\t<span>Dashboard</span>\n\t\t\t\t</a><br>\n\t\t\t\t<a routerLink=\"/members\" routerLinkActive=\"active\">\n\t\t\t\t\t<md-icon>people</md-icon>\n\t\t\t\t\t<span>Members</span>\n\t\t\t\t</a><br><a routerLink=\"/pools\" routerLinkActive=\"active\">\n\t\t\t\t\t<md-icon>call_split</md-icon>\n\t\t\t\t\t<span>Pools</span>\n\t\t\t\t</a><br><a routerLink=\"/dashboard\" routerLinkActive=\"active\">\n\t\t\t\t\t<md-icon>message</md-icon>\n\t\t\t\t\t<span>Transactions</span>\n\t\t\t\t</a><br>\n\t\t\t</nav>\n\t\t</md-sidenav>\n\n\t\t<router-outlet></router-outlet>\n\t</md-sidenav-container>\n\t",
            styleUrls: ['./app.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map