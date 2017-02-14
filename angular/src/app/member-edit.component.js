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
var router_1 = require('@angular/router');
var common_1 = require('@angular/common');
require('rxjs/add/operator/switchMap');
var data_service_1 = require('./data.service');
var MemberEditComponent = (function () {
    function MemberEditComponent(dataService, route, location) {
        this.dataService = dataService;
        this.route = route;
        this.location = location;
    }
    MemberEditComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params
            .switchMap(function (params) {
            return _this.dataService.getMember(params['address']);
        })
            .subscribe(function (member) { return _this.member = member; });
    };
    MemberEditComponent.prototype.goBack = function () {
        this.location.back(); //problematic, guard against exiting the website
    };
    MemberEditComponent.prototype.save = function () {
        this.goBack();
    };
    MemberEditComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'member-edit',
            templateUrl: './member-edit.component.html',
            styleUrls: ['./member-edit.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.ActivatedRoute, common_1.Location])
    ], MemberEditComponent);
    return MemberEditComponent;
}());
exports.MemberEditComponent = MemberEditComponent;
//# sourceMappingURL=member-edit.component.js.map