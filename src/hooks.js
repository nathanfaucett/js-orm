var hooks = module.exports;


hooks.timestamps = function(options) {
    return {
        events: {
            beforeCreate: function(values) {
                if (options.underscore === true || options.camelcase === false) {
                    values.created_at = new Date();
                    values.updated_at = new Date();
                } else {
                    values.createdAt = new Date();
                    values.updatedAt = new Date();
                }
            },
            beforeUpdate: function(values) {
                if (options.underscore === true || options.camelcase === false) {
                    values.updated_at = new Date();
                } else {
                    values.updatedAt = new Date();
                }
            }
        }
    };
};
