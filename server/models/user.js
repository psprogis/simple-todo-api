const bcrypt = require('bcrypt');
const _ = require('underscore');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

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

    // TODO: use correct secret value, remove hardcoded one
    User.prototype.generateToken = function (type) {
        if (!_.isString(type)) {
            return;
        }

        try {
            const stringData = JSON.stringify({
                id: this.get('id'),
                type,
            });

            const encryptedData = crypto.AES.encrypt(stringData, 'abc123!@#!').toString();

            const token = jwt.sign({
                token: encryptedData,
            }, 'qwerty098');

            return token;
        } catch (e) {
            console.error(e);
            return;
        }
    };

    User.findByToken = async function (token) {
        try {
            const decodedJWT = jwt.verify(token, 'qwerty098');
            const bytes = crypto.AES.decrypt(decodedJWT.token, 'abc123!@#!');
            const tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));

            try {
                const result = await User.findById(tokenData.id);

                if (result) {
                    return Promise.resolve(result);
                } else {
                    console.error('user was not found');
                    return Promise.reject();
                }
            } catch (e) {
                console.error(e);
                return Promise.reject(e);
            }

        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    };

    User.authenticate = async function (user) {
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
    };

    return User;
};
