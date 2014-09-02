module.exports = function seeds(callback) {
    var User = require("../models/user"),
        Cart = require("../models/cart");

    var length = 6;

    function done(err) {
        if (err || --length <= 0) {
            callback();
        }
    }

    User.create({
        firstName: "Nathan",
        lastName: "Faucett",
        email: "nathanfaucett@gmail.com",
        encryptedPassword: "AF3254DfFDGD2asg52SGSFRra4536DSEAEG",
        username: "nathanfaucett"
    }, done);
    User.create({
        firstName: "Bob",
        lastName: "Fatty",
        email: "bobfatty@gmail.com",
        encryptedPassword: "F34asdfDF2asg52S234GSasfdRr4df3asd",
        username: "bobfatty"
    }, done);

    Cart.create({
        userId: 1,
        title: "Great Cart",
        content: "good stuff"
    }, done);
    Cart.create({
        userId: 1,
        title: "Better Cart",
        content: "good stuff"
    }, done);

    Cart.create({
        userId: 2,
        title: "Great Cart",
        content: "good stuff"
    }, done);
    Cart.create({
        userId: 2,
        title: "Better Cart",
        content: "good stuff"
    }, done);
};
