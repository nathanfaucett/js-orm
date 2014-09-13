module.exports = function seed(callback) {
    var collection = require("./collection"),

        User = collection.models.User,
        Cart = collection.models.Cart,

        length = 0,
        errors;

    function done(err) {
        length++;

        return function doneCallback(err) {
            if (err) {
                (errors || (errors = [])).push(err);
            }
            if (--length <= 0) {
                callback(errors);
            }
        }
    }

    User.create({
        firstName: "Bob",
        lastName: "Saget",
        age: 64,
        password: "EtWtQaGOXSS4BwniSeRZU61brobcmijK",
        email: "bobsaget@gmail.com"
    }, done());

    User.create({
        firstName: "Nathan",
        lastName: "Faucett",
        age: 21,
        password: "XdG8N1aENnVKr6Gwq3qSx0knlGSfNLeZ",
        email: "nathanfaucett@gmail.com"
    }, done());


    Cart.create({
        userId: 1,
        title: "Fun cart",
        content: "nothing like this"
    }, done());

    Cart.create({
        userId: 1,
        title: "Other Fun cart",
        content: "there is something like this"
    }, done());


    Cart.create({
        userId: 2,
        title: "My cart",
        content: "its alright"
    }, done());

    Cart.create({
        userId: 2,
        title: "This Cart is Great!",
        content: "Maybe?"
    }, done());
};
