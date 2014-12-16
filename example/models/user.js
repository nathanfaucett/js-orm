var orm = require("../../src/index.js");


var SPLITER = /[\s ]+/;


var User = new orm.define({
    name: "User",

    schema: {
        firstName: "string",
        lastName: "string",
        age: "integer",
        email: {
            type: "string",
            unique: true
        },
        password: "string"
    }
});

User.accessible(
    "firstName",
    "lastName",
    "age",
    "email"
);

Object.defineProperty(User.prototype, "fullName", {
    get: function() {
        return this.firstName + " " + this.lastName;
    },
    set: function(value) {
        var split = (value || "").split(SPLITER);

        this.firstName = split[0] || this.firstName;
        this.lastName = split[1] || this.lastName;
    }
});

User.validates("email")
    .required()
    .email();

User.validates("password")
    .required()
    .minLength(6);

User.on("init", function(next) {
    var Cart = require("./cart");

    function encryptPassword(model, next) {
        model.password = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        next();
    }

    User.on("beforeCreate", encryptPassword);
    User.on("beforeSave", encryptPassword);

    User.on("destroy", function(users, next) {
        users.forEach(function(user) {
            Cart.destroy({
                where: {
                    userId: user.id
                }
            }, function(err) {
                if (err) {
                    next(err);
                    return;
                }
            });
        });
    });

    next();
});


module.exports = User;
