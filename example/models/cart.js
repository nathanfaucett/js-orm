var orm = require("../../src/index.js");


var Cart = new orm.Model({
    name: "Cart",
    adaptor: "memory"
});


module.exports = Cart;
