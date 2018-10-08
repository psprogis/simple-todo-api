const Sequelize = require('sequelize');
const path = require('path');

const DB_PATH = path.join(__dirname, './../../data/dev-todo-api.sqlite');
const MODELS_ROOT = path.join(__dirname, './../models');

const env = process.env.NODE_ENV || 'development';
let sequelize;

if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
    });
} else {
    sequelize = new Sequelize(null, null, null, {
        dialect: 'sqlite',
        storage: DB_PATH,
    });
}

const db = {};
db.todo = sequelize.import(`${MODELS_ROOT}/todo`);
db.user = sequelize.import(`${MODELS_ROOT}/user`);
db.token = sequelize.import(`${MODELS_ROOT}/token`);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;
