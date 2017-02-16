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
var pool_1 = require('./pool');
var data_service_1 = require('./data.service');
var PoolEditComponent = (function () {
    function PoolEditComponent(dataService, route, location) {
        this.dataService = dataService;
        this.route = route;
        this.location = location;
    }
    PoolEditComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.pool = new pool_1.Pool();
        this.route.params
            .switchMap(function (params) {
            return _this.dataService.getPool(params['id']);
        })
            .subscribe(function (pool) { return _this.setPool(pool); });
    };
    PoolEditComponent.prototype.setPool = function (pool) {
        this.pool.id = pool.id;
        this.pool.name = pool.name;
        this.pool.legalContract = pool.legalContract;
        this.pool.financialReports = pool.financialReports;
    };
    PoolEditComponent.prototype.goBack = function () {
        this.location.back(); //problematic, guard against exiting the website
    };
    PoolEditComponent.prototype.save = function () {
        this.pool.name = this.pool.name.trim(); //error checking
        this.pool.legalContract = this.pool.legalContract.trim();
        this.pool.financialReports = this.pool.financialReports.trim();
        if (this.pool.name.length <= 0)
            return;
        if (this.pool.legalContract.length <= 0)
            return;
        if (this.pool.financialReports.length <= 0)
            return;
        this.dataService.updatePool(this.pool);
        this.goBack();
    };
    PoolEditComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'pool-edit',
            templateUrl: './pool-edit.component.html',
            styleUrls: ['./pool-edit.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.ActivatedRoute, common_1.Location])
    ], PoolEditComponent);
    return PoolEditComponent;
}());
exports.PoolEditComponent = PoolEditComponent;
//# sourceMappingURL=pool-edit.component.js.map