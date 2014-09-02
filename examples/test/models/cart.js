var db = require("../db");


var Cart = db.define("Cart");


Object.defineProperty(Cart.prototype, "html", {
    get: function() {
        return "<h1>" + this.title + "</h1><p>" + this.content + "</p>";
    }
});


module.exports = Cart;
