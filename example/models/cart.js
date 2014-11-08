var orm = require("../../src/index.js");


var Cart = new orm.define({
    name: "Cart",

    schema: {
        title: "string",
        content: "string",
        belongsTo: "user"
    }
});

Cart.accessible(
    "title",
    "content",
    "userId"
);


module.exports = Cart;
