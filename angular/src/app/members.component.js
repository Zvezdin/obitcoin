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
var MembersComponent = (function () {
    function MembersComponent(dataService, router) {
        this.dataService = dataService;
        this.router = router;
    }
    MembersComponent.prototype.getMembers = function () {
        var _this = this;
        this.dataService.getMembers().then(function (members) { return _this.members = members; });
    };
    MembersComponent.prototype.ngOnInit = function () {
        this.getMembers();
    };
    MembersComponent.prototype.onSelect = function (member) {
        this.selectedMember = member;
    };
    MembersComponent.prototype.gotoDetail = function () {
        this.router.navigate(['/detail_member', this.selectedMember.address]);
    };
    MembersComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'members',
            templateUrl: './members.component.html',
            styleUrls: ['./members.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.Router])
    ], MembersComponent);
    return MembersComponent;
}());
exports.MembersComponent = MembersComponent;
//# sourceMappingURL=members.component.js.map