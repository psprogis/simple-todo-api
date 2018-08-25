const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('TODO API root');
});

app.listen(PORT, () => {
    console.log('express listening on port ')
});