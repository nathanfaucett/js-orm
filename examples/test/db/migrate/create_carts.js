exports.up = function(migrate) {

    migrate.createTable("carts", {
        title: {
            type: "string",
            default: ""
        },
        content: {
            type: "string",
            default: ""
        },

        belongsTo: "user",
        timestamps: true
    });
};

exports.down = function(migrate) {

    migrate.dropTable("carts");
};
