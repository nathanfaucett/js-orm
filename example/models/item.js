var orm = require("../../src/index.js");


var Item = new orm.define({
    name: "Item",

    schema: {
        title: "string",
        content: "string",
        belongsTo: ["user", "cart"]
    }
});

Item.accessible(
    "title",
    "content",
    "userId"
);


module.exports = Item;
