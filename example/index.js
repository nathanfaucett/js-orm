var collection = require("./collection"),

    User = collection.models.User,
    Cart = collection.models.Cart;

User.adaptor = "http";
Cart.adaptor = "http";

collection.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    console.time("findOne");
    User.findOne()
        .asc("age")
        .skip(1)
        .then(
            function(user) {
                console.timeEnd("findOne");

                console.time("findByUserId");
                Cart.findByUserId(user.id)
                    .then(
                        function(cart) {
                            console.timeEnd("findByUserId");
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
