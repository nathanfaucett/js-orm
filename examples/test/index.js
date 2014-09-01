var db = require("./db"),

    Cart = require("./models/cart"),
    User = require("./models/user");


db.init(function(err) {
    if (err) {
        throw err;
        return;
    }

    User.create({
        firstName: "Bob",
        lastName: "Fat",
        email: "bob@gmail.com",
        encryptedPassword: "AasdS234DFS234DFasdf45asdASDF245G",
        username: "bobfat"
    }).then(
        function(user) {
            user.delete().then(
                function(user) {

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

    /*
    User.findById(1, function(err, user) {
        if (err) {
            console.log(err);
            return;
        }
        
        user.fullName = "Bob White";
        user.save(function(err) {
            if (err) {
                console.log(err);
                return;
            }
            
            console.log(user);
        });
    });

    db.migrations.up(function(errs) {
        if (errs) {
            console.log(errs);
            return;
        }
        
        User.create({
            firstName: "Nathan",
            lastName: "Faucett",
            email: "nathanfaucett@gmail.com",
            encryptedPassword: "AF3254DfFDGD2asg52SGSFRra4536DSEAEG",
            username: "nathanfaucett"
        }).then(
            function(user) {
                console.log(user);
            },
            function(err) {
                console.log(err);
            }
        );
    });
    */
});
