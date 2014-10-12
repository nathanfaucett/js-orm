var orm = require("../src/index.js");


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
    require("./models/cart")
);
