module.exports = function(router) {
    var Cart = require("../models/cart");

    router.route("/carts/save")
        .get(
            function(req, res, next) {
                Cart.save(req.query, function(err, carts) {
                    if (err) {
                        res.json(500, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                });
            }
    );
    router.route("/carts/update")
        .get(
            function(req, res, next) {
                Cart.update(req.query, function(err, carts) {
                    if (err) {
                        res.json(500, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                });
            }
    );
    router.route("/carts/find")
        .get(
            function(req, res, next) {
                function callback(err, carts) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                }

                if (req.query) {
                    Cart.find(req.query, callback);
                } else {
                    Cart.all(callback);
                }
            }
    );
    router.route("/carts/find_one")
        .get(
            function(req, res, next) {
                Cart.findOne(req.query, function(err, carts) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                });
            }
    );
    router.route("/carts/delete")
        .get(
            function(req, res, next) {
                function callback(err, carts) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                }

                if (req.query) {
                    Cart.deleteWhere(req.query, callback);
                } else {
                    Cart.deleteAll(callback);
                }
            }
    );
    router.route("/carts/delete_one")
        .get(
            function(req, res, next) {
                Cart.deleteWhere(req.query, function(err, carts) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(carts);
                    next();
                });
            }
    );
};
