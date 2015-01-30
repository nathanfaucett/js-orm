var hooks = module.exports;


hooks.timestamps = function(options) {
    var underscore = options.underscore === true || options.camelcase === false;

    return {
        events: {
            beforeCreate: function(values, next) {
                if (underscore) {
                    values.created_at = new Date();
                    values.updated_at = new Date();
                } else {
                    values.createdAt = new Date();
                    values.updatedAt = new Date();
                }
                next();
            },
            beforeSave: function(values, next) {
                if (underscore) {
                    if (values.created_at == null) {
                        values.created_at = new Date();
                    }
                    if (values.updated_at == null) {
                        values.updated_at = new Date();
                    }
                } else {
                    if (values.createdAt == null) {
                        values.createdAt = new Date();
                    }
                    if (values.updatedAt == null) {
                        values.updatedAt = new Date();
                    }
                }
                next();
            },
            beforeUpdate: function(values, next) {
                if (underscore) {
                    values.updated_at = new Date();
                } else {
                    values.updatedAt = new Date();
                }
                next();
            }
        }
    };
};
