ORM
=======

object relational mapping for node.js

###Usage

create a new Collection

```javascript
var orm = require("orm");

var collection = orm({

    schema: {
        timestamps: true
    },

    adaptors: {
        http: new orm.MemoryAdaptor()
    }
});

collection.bindModels(
    require("./path/to/user_model"),
    require("./path/to/other_model")
);

module.exports = collection;
```

define a Model

```javascript
var orm = require("orm");

var User = orm.define({
    name: "User",
    adaptor: "memory"
});

User.prototype.hello = function() {
  
    return "hello " + this.firstName +"!";
};

// User.prototype is an object that the User instance classes, created after init, will inherit from
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
```

```javascript
var collection = require("../collection");

collection.models.User.adaptor = "memory";

collection.init(function(err) {
    if (err) {
        console.log(err.message);
        return;
    }
    
    // start application
});
```