const Sequelize = require('sequelize');
const sequelize = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: `${__dirname}/data/dev-todo-api.sqlite`
});

const db = {};

db.todo = sequelize.import(`${__dirname}/models/todo.js`);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
