const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');

const app = express();
const PORT = process.env.PORT || 3000;

const todos = [];
let todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TODO API root');
});

// GET /todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {    
    const id = parseInt(req.params.id, 10);
    const matchedTodo = _.findWhere(todos, {id})

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos', (req, res) => {
    const todo = _.pick(req.body, 'completed', 'description');

    todo.description = todo.description.trim();

    if (!_.isBoolean(todo.completed)
            || !_.isString(todo.description)
            || todo.description.length === 0) {
        return res.status(400).send();
    }

    todos.push(Object.assign({id: todoNextId++}, todo));
    
    res.json(todo);
});

app.listen(PORT, () => {
    console.log('express listening on port ')
});