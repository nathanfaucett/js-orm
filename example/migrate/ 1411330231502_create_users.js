exports.up = function(migrate) {

    migrate.createTable("users", {
        firstName: "string",
        lastName: "string",
        age: "integer",
        email: {
            type: "string",
            unique: true
        },
        password: "string"
    });
};

exports.down = function(migrate) {

    migrate.removeTable("users");
};
