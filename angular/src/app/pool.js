"use strict";
var Pool = (function () {
    function Pool() {
    }
    Pool.prototype.init = function () {
        var _this = this;
        this.totalSlices = 0;
        this.totalTokens = 0;
        this.members.forEach(function (member) {
            if (_this.slices[member.id] != undefined)
                _this.totalSlices += _this.slices[member.id];
            if (_this.tokens[member.id] != undefined)
                _this.totalTokens += _this.tokens[member.id];
        });
        console.log("Total slices for pool " + this.name + " - " + this.totalSlices + " and tokens - " + this.totalTokens);
    };
    return Pool;
}());
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map