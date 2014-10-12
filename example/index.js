global.collection = require("./collection");


global.User = collection.models.User,
global.Cart = collection.models.Cart;

if (!process.browser) {
    var Adapter = require("mongodb_adapter"),
        adapter = new Adapter({
            database: "test"
        });

    collection.bindAdapter("mongodb", adapter);

    User.adapter = "mongodb";
    Cart.adapter = "mongodb";
}

global.User_test = function() {
    console.time("User.test");
    User.find(function(err, users) {
        console.timeEnd("User.test");
        if (err) {
            console.warn(err);
            return;
        }
        console.log(users);
    });
};

global.Cart_test = function() {
    console.time("Cart.test");
    Cart.find(function(err, carts) {
        console.timeEnd("Cart.test");
        if (err) {
            console.warn(err);
            return;
        }
        console.log(carts);
    });
};

global.seed = function() {
    console.time("seed");
    require("./seed")(function(err) {
        console.timeEnd("seed");
        if (err) {
            console.log(err);
        }
    });
};


collection.init(function(err) {
    if (err) {
        console.log(err);
        return;
    }

    if (!process.browser) {
        User_test();
        Cart_test();

        User.update(2, {
            email: "noname@not.com"
        }, function(err, user) {
            console.log(err, user);
        });
    } else {
        require("./seed")(function(err) {
            if (err) {
                console.log(err);
                return;
            }

            User_test();
            Cart_test();
        });
    }
});
