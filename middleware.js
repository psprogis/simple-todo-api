module.exports = function (db) {
    return {
        async requireAuthentication(req, res, next) {
            const token = req.get('Auth');

            try {
                console.log('searching user by token');
                const user = await db.user.findByToken(token);

                console.log('found user');
                req.user = user;
                next();

            } catch (e) {
                console.error(e);
                res.status(401).send();
            }
        },
    };
};
