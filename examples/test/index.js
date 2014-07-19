var orm = require("../../src");


var User = orm.define({
    name: "User",
    adaptor: "memory",

    attributes: {
        email: {
            type: "string",
            email: true,
            unique: true
        },
        password: {
            type: "string"
        },

        firstName: "string",
        lastName: "string",

        fullName: function() {
            return this.firstName + " " + this.lastName;
        }
    }
});

var Post = orm.define({
    name: "Post",
    adaptor: "sqlite",

    attributes: {
        title: "string",
        content: "string"
    }
});

User.hasMany("posts");

orm.once("init", function(err) {

});

orm.init();
