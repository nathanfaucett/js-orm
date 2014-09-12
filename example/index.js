var orm = global.orm = require("../src/");


var collection = global.collection = new orm.Collection({
        schema: require("./schema"),
        adaptors: {
            "memory": new orm.MemoryAdaptor()
        }
    }),

    User = require("./models/user"),
    Cart = require("./models/cart");

collection.model(User, Cart);

collection.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    User.create({
        firstName: "Nathan",
        lastName: "Faucett",
        email: "nathanfaucett@gmail.com"
    }).then(
        function(user) {
            User.all(function(err, users) {
                console.log(err, users);
            });
        },
        function(err) {
            console.log(err);
        }
    );
});
