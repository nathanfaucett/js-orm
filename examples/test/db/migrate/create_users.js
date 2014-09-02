exports.up = function(migrate) {

    migrate.createTable("users", {
        firstName: "string",
        lastName: "string",
        email: {
            type: "string",
            null: false,
            defaultsTo: ""
        },
        encryptedPassword: {
            type: "string",
            null: false,
            defaultsTo: ""
        },
        username: {
            type: "string",
            null: false,
            defaultsTo: ""
        },

        timestamps: true
    });
};

exports.down = function(migrate) {

    migrate.dropTable("users");
};
