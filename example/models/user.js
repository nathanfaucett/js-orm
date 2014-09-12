var orm = require("../../src/index.js");


var User = new orm.Model({
    name: "User",
    adaptor: "memory"
});


Object.defineProperty(User.prototype, "fullName", {
    get: function() {
        return this.firstName + " " + this.lastName;
    },
    set: function(value) {
        var split = (value || "").split(/[\s ]+/);

        this.firstName = split[0] || this.firstName;
        this.lastName = split[1] || this.lastName;
    }
});


module.exports = User;
