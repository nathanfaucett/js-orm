module.exports = {
    users: {
        firstName: "string",
        lastName: "string",
        age: "integer",
        email: {
            unique: true,
            type: "string"
        },
        password: "string",
        timestamps: true
    },
    carts: {
        title: "string",
        content: "string",
        belongsTo: "user",
        timestamps: true
    }
};
