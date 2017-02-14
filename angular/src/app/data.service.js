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
var mock_members_1 = require('./mock-members');
var mock_pools_1 = require('./mock-pools');
var DataService = (function () {
    function DataService() {
    }
    DataService.prototype.getUser = function () {
        return Promise.resolve(this.members[0]);
    };
    DataService.prototype.getMembers = function () {
        return Promise.resolve(this.members);
    };
    DataService.prototype.getMembersSlowly = function () {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(function () { return resolve(_this.getMembers()); }, 2000);
        });
    };
    DataService.prototype.getMember = function (address) {
        return this.getMembers()
            .then(function (members) { return members.find(function (member) { return member.address === address; }); });
    };
    DataService.prototype.search = function (term) {
        return this.getMembers()
            .then(function (members) { return members.filter(function (member) { return member.name.includes(term); }); });
    };
    DataService.prototype.getPools = function () {
        return Promise.resolve(this.pools);
    };
    DataService.prototype.getPool = function (id) {
        return this.getPools().then(function (pools) { return pools.find(function (pool) { return pool.id === id; }); });
    };
    DataService.prototype.init = function () {
        this.members = mock_members_1.MEMBERS;
        this.mockPools = new mock_pools_1.MockPools();
        this.mockPools.init();
        this.pools = this.mockPools.getPools();
    };
    DataService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map