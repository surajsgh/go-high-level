const express = require('express');
const eventRouter = require('./routes/eventRoutes.js');

const app = express();
app.use(express.json());

app.use('/api/v1/', eventRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});