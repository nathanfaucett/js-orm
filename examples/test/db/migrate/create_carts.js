exports.up = function(migrate) {

    migrate.createTable("carts", {
        title: {
            type: "string",
            defaultsTo: ""
        },
        content: {
            type: "string",
            defaultsTo: ""
        },

        belongsTo: "user",
        timestamps: true
    });
};

exports.down = function(migrate) {

    migrate.dropTable("carts");
};
