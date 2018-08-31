const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');

const app = express();
const PORT = process.env.PORT || 3000;

let todos = [];
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
    const matchedTodo = _.findWhere(todos, {id});

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

app.listen(PORT, () => {
    console.log('express listening on port ')
});