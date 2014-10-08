var orm = require("../src/index.js");


module.exports = orm({
    schema: {
        timestamps: {
            underscore: false
        }
    },
    defaultAdaptor: "memory",
    adaptors: {
        "memory": new orm.MemoryAdaptor()
    }
})

.bindModels(
    require("./models/user"),
    require("./models/cart")
);
