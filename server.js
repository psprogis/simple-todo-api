const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

let todos = [];
let todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TODO API root');
});

// GET /todos?completed=true&q=work
app.get('/todos', async (req, res) => {
    const query = req.query;
    const where = {};

    if (query.hasOwnProperty('completed')) {
        where.completed = query.completed === 'true' ? true : false;
    }

    if (query.hasOwnProperty('q')) {
        where.description = {
            $like: `%${query.q}%`
        }
    }

    try {
        const matchedTodos = await db.todo.findAll({where});

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

app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const matchedTodo = _.findWhere(todos, {id});

    if (!matchedTodo) {
        res.status(404).json({'error': 'no todo found with passed id'});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

app.put('/todos/:id', (req, res) => {
    const todo = _.pick(req.body, 'completed', 'description');
    const id = parseInt(req.params.id, 10);
    let matchedTodo = _.findWhere(todos, {id});
    const validAttrs = {};

    if (!matchedTodo) {
        return res.status(404);
    }

    if (todo.hasOwnProperty('completed') && _.isBoolean(todo.completed)) {
        validAttrs.completed = todo.completed;
    } else if (todo.hasOwnProperty('completed')) {
        res.status(400).send();
    } else {
        // do nothing
    }

    if (todo.hasOwnProperty('description')
            && _.isString(todo.description)
            && todo.description.trin().length !== 0) {
        validAttrs.description = todo.description;
    } else if (todo.hasOwnProperty('description')) {
        res.status(400).send();
    } else {
        // do nothing
    }

    matchedTodo = _.extend(matchedTodo, validAttrs);

    res.json(todo);
});

db.sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`express listening on port ${PORT}`);
        });
    });
