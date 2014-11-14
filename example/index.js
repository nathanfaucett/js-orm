global.collection = require("./collection");


global.User = collection.models.User;
global.Cart = collection.models.Cart;
global.Item = collection.models.Item;

if (!process.browser) {
    var Adapter = require("mongodb_adapter"),
        adapter = new Adapter({
            database: "test"
        });

    collection.bindAdapter("mongodb", adapter);

    User.adapter = "mongodb";
    Cart.adapter = "mongodb";
}

global.User_test = function(callback) {
    console.time("User.test");
    User.find(function(err, users) {
        console.timeEnd("User.test");
        if (err) {
            callback && callback();
            console.warn(err);
            return;
        }
        callback && callback();
        console.log(users);
    });
};

global.Cart_test = function(callback) {
    console.time("Cart.test");
    Cart.find(function(err, carts) {
        console.timeEnd("Cart.test");
        if (err) {
            callback && callback();
            console.warn(err);
            return;
        }
        callback && callback();
        console.log(carts);
    });
};

global.Item_test = function(callback) {
    console.time("Item.test");
    Item.find(function(err, items) {
        console.timeEnd("Item.test");
        if (err) {
            callback && callback();
            console.warn(err);
            return;
        }
        callback && callback();
        console.log(items);
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
        User_test(function() {
            Cart_test(Item_test);
        });
    } else {
        require("./seed")(function(err) {
            if (err) {
                console.log(err);
                return;
            }

            User_test(function() {
                Cart_test(Item_test);
            });
        });
    }
});
