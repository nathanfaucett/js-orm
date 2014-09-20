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


module.exports = User;
