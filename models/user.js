const bcrypt = require('bcrypt');
const _ = require('underscore');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        salt: {
            type: DataTypes.STRING,
        },
        password_hash: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100],
            },
            set(value) {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            },
        },
    }, {
        hooks: {
            beforeValidate: (user) => {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            },
        },
    });

    User.prototype.toPublicJSON = function () {
        const json = this.toJSON();

        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
    };

    User.authenticate = async function(user) {
        if (typeof user.email !== 'string' || typeof user.password !== 'string') {
            return Promise.reject();
        }

        try {
            const result = await User.findOne({
                where: {
                    email: user.email,
                },
            });

            if (!result || !bcrypt.compareSync(user.password, result.get('password_hash'))) {
                return Promise.reject();
            }

            return Promise.resolve(result);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    return User;
};
