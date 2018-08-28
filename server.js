const express = require('express');
const bodyParser = require('body-parser');

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

    todos.forEach(todo => {
        if (todo.id === id) {
            res.json(todo);
        }
    })

    res.status(404).send();
});

app.post('/todos', (req, res) => {
    const body = req.body;

    todos.push(Object.assign({id: todoNextId++}, body));
    
    res.json(body);
});

app.listen(PORT, () => {
    console.log('express listening on port ')
});