var collection = require("./collection"),

    User = collection.models.User,
    Cart = collection.models.Cart;

global.collection = collection;

collection.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    require("./seed")(function(errors) {
        if (errors) {
            console.log(errors);
            return;
        }

        User.findOne()
            .asc("age")
            .skip(1)
            .then(
                function(user) {
                    Cart.findByUserId(user.id)
                        .then(
                            function(cart) {
                                console.log(cart);
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
