module.exports = {
    users: {
        firstName: "string",
        lastName: "string",
        email: {
            type: "string",
            unique: true
        },
        password: "string",
        //hasMany: "carts",
        timestamps: true
    },
    carts: {
        title: "string",
        content: "string",
        //belongsTo: "user"
        timestamps: true
    }
};
