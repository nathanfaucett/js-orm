var db = require("../db");


var SPLITER = /[\s ]+/,
    User = db.define("User");


Object.defineProperty(User.prototype, "fullName", {
    get: function() {
        return this.firstName + " " + this.lastName;
    },
    set: function(value) {
        value = (value + "").split(SPLITER);

        this.firstName = value[0] || this.firstName;
        this.lastName = value[1] || this.lastName;
    }
});


module.exports = User;
