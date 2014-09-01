ORM
=======

object relational mapping for node.js

###Usage

create a new ORM object

```javascript
var ORM = require("orm");

var db = new ORM({

    defaultAdaptor: "sqlite",

    adaptors: {
        "sqlite": new ORM.SQLiteAdaptor()
    },
    schema: {
        file: "db/schema.json"
    },
    migrations: {
        folder: "db/migrate"
    }
});

module.exports = db;
```

create a collection

```javascript
var db = require("../db");

var User = db.define("User");

// User.prototype is an object that the Model created after init will inherit
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

// other events include update, delete, deleteWhere and deleteAll
User.on("save", function(row) {

});


module.exports = User;
```

```javascript
var db = require("../db");

db.init(function(err) {
    if (err) {
        console.log(err.message);
        return;
    }
    
    // start application
});


// some other place
var User = require("./models/user");

User.findById(10).then(
  function(user) {
    console.log(user);
  },
  function(err) {
    console.log(err);
  }
);
```