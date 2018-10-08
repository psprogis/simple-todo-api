const db = require('./server/db');

db.sequelize.sync({ force: true })
    .then(() => {
        require('./server/server');
    });
