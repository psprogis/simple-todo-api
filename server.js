const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TODO API root');
});

// GET /todos?completed=true&q=work
app.get('/todos', async (req, res) => {
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
app.get('/todos/:id', async (req, res) => {
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

app.post('/todos', async (req, res) => {
    const todo = _.pick(req.body, 'completed', 'description');

    try {
        const result = await db.todo.create(todo);

        res.json(result.toJSON());
    } catch (e) {
        res.status(400).json(e);
    }
});

app.delete('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const rowsDeleted = await db.todo.destroy({where: {id}});

        if (rowsDeleted === 0) {
            res.status(404).json({ error: 'no todo found with passed id' });
        } else {
            res.status(204).send();
        }

    } catch (e) {
        res.status(500).send();
    }
});

app.put('/todos/:id', async (req, res) => {
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

db.sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`express listening on port ${PORT}`);
        });
    });
