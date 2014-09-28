global.collection = require("./collection");


global.User = collection.models.User,
global.Cart = collection.models.Cart;

if (!process.browser) {
    var SQLite3Adaptor = require("sqlite3_adaptor"),
        adaptor = new SQLite3Adaptor({
            file: __dirname + "/sqlite.db"
        });

    collection.bindAdaptor("sqlite3", adaptor);

    User.adaptor = "sqlite3";
    Cart.adaptor = "sqlite3";
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

var UID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function uid(length) {
    var str = "";
    length || (length = 24);
    while (length--) str += UID_CHARS[(Math.random() * 62) | 0];
    return str;
}


User.on("init", function() {

    this.on("beforeCreate", function(model) {

        model.password = uid();
    });
});


collection.init(function(err) {
    if (err) {
        console.log(err);
        return;
    }

    if (!process.browser) {
        User_test();
        Cart_test();
    } else {
        require("./seed")(function(err) {
            if (err) {
                console.log(err);
            }

            User_test();
            Cart_test();
        });
    }
});
