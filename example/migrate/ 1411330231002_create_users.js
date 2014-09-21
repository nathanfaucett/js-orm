exports.up = function(migrate) {

    migrate.createTable("users", {
        firstName: "string",
        lastName: "string"
    });
};

exports.down = function(migrate) {

    migrate.removeTable("users");
};
