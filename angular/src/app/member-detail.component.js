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
var MemberDetailComponent = (function () {
    function MemberDetailComponent(dataService, route, location, router) {
        this.dataService = dataService;
        this.route = route;
        this.location = location;
        this.router = router;
    }
    MemberDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params
            .switchMap(function (params) {
            return _this.dataService.getMember(params['id']);
        })
            .subscribe(function (member) { return (member == undefined ? _this.dataService.getUser().then(function (member) { return _this.member = member; }) : _this.member = member,
            _this.dataService.getPools().then(function (pools) {
                _this.pools = pools.filter(function (pool) { return pool.members.find(function (member2) { return member2 == _this.member; }) != undefined; }),
                    _this.initData();
            })); });
    };
    MemberDetailComponent.prototype.initData = function () {
        var _this = this;
        this.pools.forEach(function (pool) {
            pool.init();
            pool.tokensShare = ((pool.tokens[_this.member.id] / pool.totalTokens) * 100).toFixed(2) + "%";
            pool.slicesShare = ((pool.slices[_this.member.id] / pool.totalSlices) * 100).toFixed(2) + "%";
        });
    };
    MemberDetailComponent.prototype.goBack = function () {
        this.location.back(); //problematic, guard against exiting the website
    };
    MemberDetailComponent.prototype.edit = function () {
        this.router.navigate(['/edit_member', this.member.id]);
    };
    MemberDetailComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'member-detail',
            templateUrl: './member-detail.component.html',
            styleUrls: ['./member-detail.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.ActivatedRoute, common_1.Location, router_1.Router])
    ], MemberDetailComponent);
    return MemberDetailComponent;
}());
exports.MemberDetailComponent = MemberDetailComponent;
//# sourceMappingURL=member-detail.component.js.map