var repl = require("repl"),
    each = require("each"),
    collection = require("../example/collection");


collection.init(function(err) {
    var replServer;

    if (err) {
        console.log(err);
        return;
    }

    replServer = repl.start({
        prompt: "> "
    });

    each(collection.models, function(model, name) {

        replServer.context[name] = model;
    });

    replServer.context.collection = collection;
});
