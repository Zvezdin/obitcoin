"use strict";
var Pool = (function () {
    function Pool() {
    }
    Pool.prototype.init = function () {
        var _this = this;
        this.totalSlices = 0;
        this.totalTokens = 0;
        this.members.forEach(function (member) {
            if (_this.slices[member.address] != undefined)
                _this.totalSlices += _this.slices[member.address];
            if (_this.tokens[member.address] != undefined)
                _this.totalTokens += _this.tokens[member.address];
        });
        console.log("Total slices for pool " + this.name + " - " + this.totalSlices + " and tokens - " + this.totalTokens);
    };
    return Pool;
}());
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map