var orm = global.orm = require("../src/");


var User = require("./models/user"),
    Cart = require("./models/cart");


module.exports = new orm.Collection({
    schema: require("./schema"),
    adaptors: {
        "memory": new orm.MemoryAdaptor()
    }
})

.model(
    User,
    Cart
);
