const crypto = require('crypto-js');

module.exports = function (db) {
    return {
        async requireAuthentication(req, res, next) {
            const token = req.get('Auth') || '';

            try {
                const tokenInstance = await db.token.findOne({
                    where: {
                        tokenHash: crypto.MD5(token).toString(),
                    },
                });

                if (!tokenInstance) {
                    throw new Error();
                }

                req.token = tokenInstance;
                const user = await db.user.findByToken(token);
                req.user = user;

                next();

            } catch (e) {
                res.status(401).send();
            }
        },
    };
};
