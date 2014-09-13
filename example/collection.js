var orm = global.orm = require("../src/");


var User = require("./models/user"),
    Cart = require("./models/cart");


module.exports = new orm.Collection({
    schema: require("./schema"),
    adaptors: {
        "memory": new orm.MemoryAdaptor(),
        "http": new orm.HttpAdaptor({
            url: "http://localhost:3000"
        })
    }
})
    .model(
        User,
        Cart
);
