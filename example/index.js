var collection = require("./collection"),

    User = collection.models.User,
    Cart = collection.models.Cart;

User.adaptor = "http";
Cart.adaptor = "http";

function makeRequest() {
    console.time("findOne");
    User.findById((1 + Math.random() * 2) | 0)
        .then(
            function(user) {
                console.timeEnd("findOne");
                console.log(user);

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
}
global.makeRequest = makeRequest;
global.collection = collection;

collection.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    makeRequest();
});
