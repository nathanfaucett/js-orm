global.collection = require("./collection");


global.User = collection.models.User,
global.Cart = collection.models.Cart;

if (!process.browser) {
    var SQLite3Adaptor = require("sqlite3_adaptor"),
        adaptor = new SQLite3Adaptor({
            file: "./sqlite3_database"
        });

    collection.bindAdaptor("sqlite3", adaptor);

    User.adaptor = "sqlite3";
    Cart.adaptor = "sqlite3";
}

global.User_test = function() {
    console.time("User.test");
    User.find(function(err, users) {
        console.timeEnd("User.test");
        console.log(users);
    });
};
global.Cart_test = function() {
    console.time("Cart.test");
    Cart.find(function(err, carts) {
        console.timeEnd("Cart.test");
        console.log(carts);
    });
};


var UID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function uid(length) {
    var str = "";
    length || (length = 24);
    while (length--) str += UID_CHARS[(Math.random() * 62) | 0];
    return str;
};


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

    require("./seed")(function(err) {
        if (err) {
            console.log(err);
            return;
        }

        User_test();
        Cart_test();
    });
});
