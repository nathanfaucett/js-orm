exports.up = function(migrate) {

    migrate.createTable("users", {
        firstName: "string",
        lastName: "string",
        email: {
            type: "string",
            null: false,
            default: ""
        },
        encryptedPassword: {
            type: "string",
            null: false,
            default: ""
        },
        username: {
            type: "string",
            null: false,
            default: ""
        },

        timestamps: true
    });
};

exports.down = function(migrate) {

    migrate.dropTable("users");
};
