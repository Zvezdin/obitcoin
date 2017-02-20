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
var pool_1 = require('./pool');
var transaction_1 = require('./transaction');
var mock_pools_1 = require('./mock-pools');
var DataService = (function () {
    function DataService() {
        var _this = this;
        this.handlePools = function (pools, callback) {
            var self = _this;
            _this.pools = [];
            pools.forEach(function (pool) {
                var newPool = new pool_1.Pool();
                newPool.id = pool.id;
                newPool.financialReports = pool.financialReports;
                newPool.legalContract = pool.legalContract;
                newPool.name = pool.name;
                newPool.slices = pool.slices;
                newPool.tokens = pool.tokens;
                newPool.members = [];
                var members = pool.members;
                members.forEach(function (id) {
                    self.getMember(id).then(function (member) {
                        newPool.members.push(member);
                    });
                });
                self.pools.push(newPool);
            });
            callback(_this.pools);
        };
        this.handleMembers = function (members) {
            _this.members = members;
        };
        this.handleEvent = function (event) {
            console.log(event.event);
            var d = new Date(0);
            d.setUTCSeconds(event.args.time);
            var transaction = new transaction_1.Transaction();
            transaction.type = event.event;
            transaction.date = d.toLocaleString();
            transaction.from = event.args.from;
            switch (event.event) {
                case "PoolCreated":
                    {
                        transaction.pool = event.args.pool;
                    }
                    break;
                case "CoinsTransfer":
                    {
                        transaction.to = event.args.to;
                        transaction.pool = event.args.pool;
                        transaction.data = event.args.amount + " tokens";
                    }
                    break;
                case "CoinsPurchase":
                    {
                        transaction.pool = event.args.pool;
                        transaction.data = event.args.amount + " tokens";
                    }
                    break;
                case "UnauthorizedAccess":
                    {
                        transaction.data = "from address: " + event.args.fromAddress;
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
        var _this = this;
        if (this.members != undefined)
            return Promise.resolve(this.members); //return the cached version
        return new Promise(function (resolve) {
            var self = _this;
            _this.contract.getWholeMembers(function (members) {
                self.members = members;
                resolve(members);
            });
        });
    };
    DataService.prototype.getPoolMembers = function (pool) {
        return this.getMembers()
            .then(function (members) { return members.filter(function (member) { return pool.members.find(function (member2) { return member2.id == member.id; }); }); });
    };
    DataService.prototype.getMembersSlowly = function () {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(function () { return resolve(_this.getMembers()); }, 2000);
        });
    };
    DataService.prototype.getMember = function (id) {
        console.log("Getting member with id " + id);
        return this.getMembers()
            .then(function (members) { return members.find(function (member) { return member.id == id; }); });
    };
    DataService.prototype.search = function (term) {
        return this.getMembers()
            .then(function (members) { return members.filter(function (member) { return member.name.includes(term); }); });
    };
    DataService.prototype.getPools = function () {
        var _this = this;
        if (this.pools != undefined)
            return Promise.resolve(this.pools);
        var self = this;
        return new Promise(function (resolve) {
            _this.contract.getWholePools(function (pools) {
                self.pools = [];
                pools.forEach(function (pool) {
                    var newPool = new pool_1.Pool();
                    newPool.id = pool.id;
                    newPool.financialReports = pool.financialReports;
                    newPool.legalContract = pool.legalContract;
                    newPool.name = pool.name;
                    newPool.slices = pool.slices;
                    newPool.tokens = pool.tokens;
                    newPool.members = [];
                    var members = pool.members;
                    members.forEach(function (id) {
                        self.getMember(id).then(function (member) {
                            newPool.members.push(member);
                        });
                    });
                    self.pools.push(newPool);
                });
                resolve(self.pools);
            });
        });
    };
    DataService.prototype.getPool = function (id) {
        return this.getPools().then(function (pools) { return pools.find(function (pool) { return pool.id == id; }); });
    };
    DataService.prototype.getTransactions = function () {
        return Promise.resolve(this.transactions);
    };
    DataService.prototype.updateMember = function (member) {
        var oldMember = this.members.find(function (member2) { return member2.id == member.id; });
        oldMember.name = member.name;
        oldMember.address = member.address;
    };
    DataService.prototype.updatePool = function (pool) {
        var oldPool = this.pools.find(function (pool2) { return pool2.id == pool.id; });
        oldPool.name = pool.name;
        oldPool.legalContract = pool.legalContract;
        oldPool.financialReports = pool.financialReports;
    };
    DataService.prototype.init = function () {
        this.self = this;
        this.mockPools = new mock_pools_1.MockPools();
        //this.transactions = TRANSACTIONS;
        this.transactions = [];
        this.mockPools.init();
        //this.pools=this.mockPools.getPools();
        this.contract = new contract_integration();
        this.contract.connectToContract("0xad2b2b39f0e1048ebee657bba379011cbe5523f5");
        this.contract.startListeningForEvents(this.handleEvent);
        /*this.contract.getPools();
        this.contract.getPoolData(1);
        this.contract.getPoolParticipants(1);
        this.contract.getMemberBalance(1,1);
        this.contract.getWhileMembers();
        this.contract.getMemberName(1);
        this.contract.getMemberAddress(1);
        this.contract.getMemberPermLevel(1);*/
        //this.contract.getWholeMembers(this.handleMembers);
        //this.contract.getWholePools(this.handlePools);
    };
    DataService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map