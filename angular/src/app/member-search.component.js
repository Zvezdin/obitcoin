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
var data_service_1 = require('./data.service');
var MemberSearchComponent = (function () {
    function MemberSearchComponent(dataService, router) {
        this.dataService = dataService;
        this.router = router;
    }
    MemberSearchComponent.prototype.search = function (term) {
        var _this = this;
        if (term.length == 0)
            this.members = null;
        else
            this.dataService.search(term).then(function (members) { return _this.members = members; });
    };
    MemberSearchComponent.prototype.ngOnInit = function () {
    };
    MemberSearchComponent.prototype.gotoDetail = function (member) {
        var link = ['/detail_member', member.address];
        this.router.navigate(link);
    };
    MemberSearchComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'member-search',
            templateUrl: './member-search.component.html',
            styleUrls: ['./member-search.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.Router])
    ], MemberSearchComponent);
    return MemberSearchComponent;
}());
exports.MemberSearchComponent = MemberSearchComponent;
//# sourceMappingURL=member-search.component.js.map