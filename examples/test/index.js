var db = require("./db"),

    Cart = require("./models/cart"),
    User = require("./models/user");


db.init(function(err) {
    if (err) {
        throw err;
        return;
    }

    require("./db/seed")(function(err) {
        if (err) {
            throw err;
            return;
        }

        console.time("User all");
        User.all().then(
            function(users) {
                console.timeEnd("User all");

                users.forEach(function(user) {
                    console.log(user, user.fullName);
                });

                console.time("Cart all");
                Cart.all().then(
                    function(carts) {
                        console.timeEnd("Cart all");

                        carts.forEach(function(cart) {
                            console.log(cart, cart.html);
                        });
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            },
            function(err) {
                console.log(err);
            }
        );
    });
});
