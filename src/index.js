const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.json());
app.use(routes);
app.listen(PORT, HOST, () => {
    console.log("Started at http://localhost:3000");
})