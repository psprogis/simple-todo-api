const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const todos = [{
    id: 1,
    description: 'meet mom for lunch',
    completed: false,    
}, {
    id: 2,
    description: 'go to market',
    completed: false
}, {
    id: 3,
    description: 'finish work',
    completed: true
}];

app.get('/', (req, res) => {
    res.send('TODO API root');
});

// GET /todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {    
    const id = parseInt(req.params.id);

    todos.forEach(todo => {
        if (todo.id === id) {
            res.json(todo);
        }
    })

    res.status(404).send();
});

app.listen(PORT, () => {
    console.log('express listening on port ')
});