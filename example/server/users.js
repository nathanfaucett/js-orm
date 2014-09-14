module.exports = function(router) {
    var User = require("../models/user");

    router.route("/users/save")
        .get(
            function(req, res, next) {
                User.save(req.query, function(err, users) {
                    if (err) {
                        res.json(500, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                });
            }
    );
    router.route("/users/update")
        .get(
            function(req, res, next) {
                User.update(req.query, function(err, users) {
                    if (err) {
                        res.json(500, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                });
            }
    );
    router.route("/users/find")
        .get(
            function(req, res, next) {
                function callback(err, users) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                }

                if (req.query) {
                    User.find(req.query, callback);
                } else {
                    User.all(callback);
                }
            }
    );
    router.route("/users/find_one")
        .get(
            function(req, res, next) {
                User.findOne(req.query, function(err, users) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                });
            }
    );
    router.route("/users/delete")
        .get(
            function(req, res, next) {
                function callback(err, users) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                }

                if (req.query) {
                    User.deleteWhere(req.query, callback);
                } else {
                    User.deleteAll(callback);
                }
            }
    );
    router.route("/users/delete_one")
        .get(
            function(req, res, next) {
                User.deleteWhere(req.query, function(err, users) {
                    if (err) {
                        res.json(404, err);
                        next();
                        return;
                    }

                    res.json(users);
                    next();
                });
            }
    );
};
