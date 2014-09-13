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

router.route("/carts/find")
    .get(
        function(req, res, next) {

            Cart.find(req.query, function(err, cart) {
                if (err) {
                    res.json(404, err);
                    next();
                    return;
                }

                res.json(cart);
                next();
            });
        }
);

router.route("/users/findOne")
    .get(
        function(req, res, next) {

            User.findOne(req.query, function(err, user) {
                if (err) {
                    res.json(404, err);
                    next();
                    return;
                }

                res.json(user);
                next();
            });
        }
);

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
