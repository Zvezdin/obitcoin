"use strict";
var pool_1 = require('./pool');
var mock_members_1 = require('./mock-members');
var MockPools = (function () {
    function MockPools() {
    }
    MockPools.prototype.init = function () {
        this.pools = [];
        this.pools[0] = new pool_1.Pool();
        this.pools[1] = new pool_1.Pool();
        this.pools[0].id = 123;
        this.pools[0].name = "ChickenRun";
        this.pools[0].legalContract = "www.google.com";
        this.pools[0].financialReports = "www.facebook.com";
        this.pools[0].members = mock_members_1.MEMBERS.slice(0, 3);
        this.pools[0].tokens = new Map();
        this.pools[0].slices = new Map();
        this.pools[0].tokens[this.pools[0].members[0].address] = 32;
        this.pools[0].slices[this.pools[0].members[0].address] = 8;
        this.pools[0].tokens[this.pools[0].members[2].address] = 13;
        this.pools[0].slices[this.pools[0].members[2].address] = 0;
        this.pools[1].id = 512;
        this.pools[1].name = "Classified project";
        this.pools[1].legalContract = "www.google.com";
        this.pools[1].financialReports = "www.facebook.com";
        this.pools[1].members = mock_members_1.MEMBERS.slice(2, 6);
        this.pools[1].tokens = new Map();
        this.pools[1].slices = new Map();
        this.pools[1].tokens[this.pools[0].members[0].address] = 123;
        this.pools[1].slices[this.pools[0].members[0].address] = 500;
        this.pools[1].tokens[this.pools[0].members[1].address] = 32;
        this.pools[1].slices[this.pools[0].members[1].address] = 3;
    };
    MockPools.prototype.getPools = function () {
        return this.pools;
    };
    return MockPools;
}());
exports.MockPools = MockPools;
//# sourceMappingURL=mock-pools.js.map