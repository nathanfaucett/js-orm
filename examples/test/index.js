var db = require("./db"),

    Cart = require("./models/cart"),
    User = require("./models/user");


db.init(function(err) {
    if (err) {
        throw err;
        return;
    }

    console.time("find");
    User.all().then(
        function(users) {
            console.log(users);
            console.timeEnd("find");
        },
        function(err) {
            console.log(err);
        }
    );

    console.time("find");
    Cart.all().then(
        function(carts) {
            console.log(carts);
            console.timeEnd("find");
        },
        function(err) {
            console.log(err);
        }
    );
});
