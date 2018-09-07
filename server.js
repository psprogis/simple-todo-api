const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const db = require('./db');
const middleware = require('./middleware')(db);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TODO API root');
});

// GET /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, async (req, res) => {
    const { query } = req;
    const where = {};

    if (query.hasOwnProperty('completed')) {
        where.completed = query.completed === 'true' ? true : false;
    }

    if (query.hasOwnProperty('q')) {
        where.description = {
            $like: `%${query.q}%`,
        };
    }

    try {
        const matchedTodos = await db.todo.findAll({ where });

        res.json(matchedTodos);
    } catch (e) {
        res.status(500).send();
    }
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const matchedTodo = await db.todo.findById(id);

        if (matchedTodo) {
            res.json(matchedTodo.toJSON());
        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.status(500).send();
    }
});

app.post('/todos', middleware.requireAuthentication, async (req, res) => {
    const todo = _.pick(req.body, 'completed', 'description');

    try {
        const result = await db.todo.create(todo);

        await req.user.addTodo(result);
        await result.reload();

        res.json(result.toJSON());
    } catch (e) {
        res.status(400).json(e);
    }
});

app.delete('/todos/:id', middleware.requireAuthentication, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const rowsDeleted = await db.todo.destroy({ where: { id } });

        if (rowsDeleted === 0) {
            res.status(404).json({ error: 'no todo found with passed id' });
        } else {
            res.status(204).send();
        }

    } catch (e) {
        res.status(500).send();
    }
});

app.put('/todos/:id', middleware.requireAuthentication, async (req, res) => {
    const todo = _.pick(req.body, 'completed', 'description');
    const id = parseInt(req.params.id, 10);
    const attributes = {};

    if (todo.hasOwnProperty('completed')) {
        attributes.completed = todo.completed;
    }

    if (todo.hasOwnProperty('description')) {
        attributes.description = todo.description;
    }

    try {
        const updateTodo = await db.todo.findById(id);

        if (updateTodo) {
            try {
                const result = await updateTodo.update(attributes);
                res.json(result.toJSON());

            } catch (e) {
                res.status(400).json(e);
            }

        } else {
            res.status(404).send();
        }
    } catch (e) {
        res.status(500).send();
    }
});

app.post('/users', async (req, res) => {
    const user = _.pick(req.body, 'email', 'password');

    try {
        const result = await db.user.create(user);

        res.json(result.toPublicJSON());
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post('/users/login', async (req, res) => {
    const user = _.pick(req.body, 'email', 'password');

    try {
        const result = await db.user.authenticate(user);
        const token = result.generateToken('authentication');

        if (token) {
            res.header('Auth', token).json(result.toPublicJSON());
        } else {
            res.status(401).send();
        }

    } catch (e) {
        console.error(e);
        res.status(401).send();
    }
});

db.sequelize.sync({force: true})
    .then(() => {
        app.listen(PORT, () => {
            console.log(`express listening on port ${PORT}`);
        });
    });
