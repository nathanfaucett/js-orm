var orm = require("../src/index.js");


var User = require("./models/user"),
    Cart = require("./models/cart");


module.exports = new orm({
    schema: {
        timestamps: {
            underscore: false
        }
    },
    adaptors: {
        "memory": new orm.MemoryAdaptor()
    }
})

.bindModels(User, Cart);
