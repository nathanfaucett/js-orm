exports.up = function(migrate) {

    migrate.createTable("carts", {
        title: "string",
        content: "string",
        belongsTo: "user"
    });
};

exports.down = function(migrate) {

    migrate.removeTable("carts");
};
