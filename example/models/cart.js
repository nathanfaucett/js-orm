var orm = require("../../src/index.js");


var Cart = new orm.Model({
    name: "Cart",
    adaptor: "memory"
});

Cart.prototype.toJSON = function() {
    var json = {};

    json.title = this.title || "";
    json.content = this.content || "";

    return json;
};


module.exports = Cart;
