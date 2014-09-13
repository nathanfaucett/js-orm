var orm = global.orm = require("../src/");


var User = require("./models/user"),
    Cart = require("./models/cart");

var collection = global.collection = new orm.Collection({
    schema: require("./schema"),
    adaptors: {
        "memory": new orm.MemoryAdaptor()
    }
})

.model(
    User,
    Cart
)

.init(function(errors) {
    if (errors) {
        console.log(errors);
        return;
    }

    User.create({
        firstName: "Nathan",
        lastName: "Faucett",
        password: "2304Djq0243ADFfasr24A243DFsfdASDF45xdg56h36FDhjiF4",
        email: "nathanfaucett@gmail.com"
    }).then(
        function(user) {
            User.all(function(err, users) {
                console.log(users);
            });
        },
        function(err) {
            console.log(err);
        }
    );
});
