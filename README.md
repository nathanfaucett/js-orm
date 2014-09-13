ORM
=======

object relational mapping for node.js

###Usage

create a new orm.Collection

```javascript
var orm = require("orm");

var collection = new orm.Collection({

    schema: require("./path/to/schema"),

    adaptors: {
        http: new orm.HttpAdaptor({
            url: "127.0.0.1:3000",
            paths: {
              users: {
                url: "www.users.com"
              }
            }
        })
    }
});

collection.model(
  require("./path/to/user_model")
  require("./path/to/other_model")
);

module.exports = collection;
```

create a Model

```javascript
var orm = require("orm");

var User = new orm.Model({
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

collection.models.User.adaptor = "http";

db.init(function(err) {
    if (err) {
        console.log(err.message);
        return;
    }
    
    // start application
});
```

notes on the example
=====

in server folder install npm deps and then listen on localhost 3000 by exec node index.js

they will be some errors in the console its just require.js trying to find the node
modules