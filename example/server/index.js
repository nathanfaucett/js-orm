var layers = require("layers"),
    context = require("context"),

    Cors = require("cors"),
    BodyParser = require("body_parser");


var router = new layers.Router(),
    server = new require("http").Server(function(req, res) {
        context.init(req, res);
        router.handler(req, res);
    }),

    collection = require("../collection"),

    User = collection.models.User,
    Cart = collection.models.Cart;

User.adaptor = "memory";
Cart.adaptor = "memory";

router.use(
    new Cors(),
    new BodyParser()
);

require("./carts")(router);
require("./users")(router);

collection.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    require("../seed")(function(errors) {
        if (errors) {
            console.log(errors);
            return;
        }

        server.listen(3000);
    });
});
