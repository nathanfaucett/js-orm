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
            beforeSave: function(values) {
                if (options.underscore === true || options.camelcase === false) {
                    if (values.created_at == null) values.created_at = new Date();
                    if (values.updated_at == null) values.updated_at = new Date();
                } else {
                    if (values.createdAt == null) values.createdAt = new Date();
                    if (values.updatedAt == null) values.updatedAt = new Date();
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
