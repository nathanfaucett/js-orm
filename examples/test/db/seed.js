var User = require("../models/user"),
    Cart = require("../models/cart");

require("./index.js").init(function(err) {
    if (err) {
        console.log(err);
        return;
    }

    User.create({
        firstName: "Nathan",
        lastName: "Faucett",
        email: "nathanfaucett@gmail.com",
        encryptedPassword: "AF3254DfFDGD2asg52SGSFRra4536DSEAEG",
        username: "nathanfaucett"
    });
    User.create({
        firstName: "Bob",
        lastName: "Fatty",
        email: "bobfatty@gmail.com",
        encryptedPassword: "F34asdfDF2asg52S234GSasfdRr4df3asd",
        username: "bobfatty"
    });

    Cart.create({
        userId: 1,
        title: "Great Cart",
        content: "good stuff"
    });
    Cart.create({
        userId: 1,
        title: "Better Cart",
        content: "good stuff"
    });

    Cart.create({
        userId: 2,
        title: "Great Cart",
        content: "good stuff"
    });
    Cart.create({
        userId: 2,
        title: "Better Cart",
        content: "good stuff"
    });
});
