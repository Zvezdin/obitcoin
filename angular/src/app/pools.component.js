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
var PoolsComponent = (function () {
    function PoolsComponent(dataService, router) {
        this.dataService = dataService;
        this.router = router;
    }
    PoolsComponent.prototype.getPools = function () {
        var _this = this;
        this.dataService.getPools().then(function (pools) {
            _this.pools = pools,
                _this.pools.forEach(function (pool) { return pool.init(); });
        });
    };
    PoolsComponent.prototype.ngOnInit = function () {
        this.getPools();
    };
    PoolsComponent.prototype.onSelect = function (pool) {
        this.router.navigate(['/detail_pool', pool.id]);
    };
    PoolsComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'pools',
            templateUrl: './pools.component.html',
            styleUrls: ['./pools.component.css'],
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService, router_1.Router])
    ], PoolsComponent);
    return PoolsComponent;
}());
exports.PoolsComponent = PoolsComponent;
//# sourceMappingURL=pools.component.js.map