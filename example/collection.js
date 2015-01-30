var orm = require("../src/index");


module.exports = orm({
    schema: {
        timestamps: {
            underscore: false
        }
    },
    defaultAdapter: "memory",
    adapters: {
        "memory": new orm.MemoryAdapter()
    }
})

.bindModels(
    require("./models/user"),
    require("./models/cart"),
    require("./models/item")
);
