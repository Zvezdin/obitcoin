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
var transaction_1 = require('./transaction');
var mock_members_1 = require('./mock-members');
var mock_pools_1 = require('./mock-pools');
var DataService = (function () {
    function DataService() {
        var _this = this;
        this.handleEvent = function (event) {
            console.log(event.event);
            var d = new Date(0);
            d.setUTCSeconds(event.args.time);
            var transaction = new transaction_1.Transaction();
            transaction.type = event.event;
            transaction.date = d.toLocaleString();
            switch (event.event) {
                case "PoolCreated":
                    {
                        transaction.from = event.args.by;
                        transaction.pool = event.args.index.valueOf();
                    }
                    break;
                case "CoinsTransfer":
                    {
                        transaction.from = event.args.from;
                        transaction.to = event.args.to;
                        transaction.pool = event.args.poolIndex;
                        transaction.data = event.args.amount + " tokens";
                    }
                    break;
                case "CoinsPurchase":
                    {
                        transaction.from = event.args.from;
                        transaction.pool = event.args.poolIndex;
                        transaction.data = event.args.amount + " tokens";
                    }
                    break;
                case "UnauthorizedAccess":
                    {
                        transaction.from = event.args.from;
                    }
                    break;
                case "AdminChanged":
                    {
                        transaction.to = event.args.person;
                        transaction.data = event.args.added ? "Admin added" : "Admin removed";
                    }
                    break;
            }
            _this.transactions.push(transaction);
        };
    }
    DataService.prototype.getUser = function () {
        return Promise.resolve(this.members[0]);
    };
    DataService.prototype.getMembers = function () {
        return Promise.resolve(this.members);
    };
    DataService.prototype.getPoolMembers = function (pool) {
        return this.getMembers()
            .then(function (members) { return members.filter(function (member) { return pool.members.find(function (member2) { return member2.address == member.address; }); }); });
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
        return this.getPools().then(function (pools) { return pools.find(function (pool) { return pool.id == id; }); });
    };
    DataService.prototype.getTransactions = function () {
        return Promise.resolve(this.transactions);
    };
    DataService.prototype.updateMember = function (member) {
        var oldMember = this.members.find(function (member2) { return member2.address == member.address; });
        oldMember.name = member.name;
    };
    DataService.prototype.updatePool = function (pool) {
        var oldPool = this.pools.find(function (pool2) { return pool2.id == pool.id; });
        oldPool.name = pool.name;
        oldPool.legalContract = pool.legalContract;
        oldPool.financialReports = pool.financialReports;
    };
    DataService.prototype.init = function () {
        this.self = this;
        this.members = mock_members_1.MEMBERS;
        this.mockPools = new mock_pools_1.MockPools();
        //this.transactions = TRANSACTIONS;
        this.transactions = [];
        this.mockPools.init();
        this.pools = this.mockPools.getPools();
        this.contract = new contract_integration();
        this.contract.connectToContract("0xa2bfcdb45344c9544c97bfca947092d7e4676f94");
        this.contract.startListeningForEvents(this.handleEvent);
    };
    DataService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map