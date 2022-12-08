const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session')

const { render } = require('ejs');

const port = 3000;

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('assets')) // soporte de archivos estaticos
app.set('view engine', 'ejs') // Configuramos el motor de templates
app.use(session({
    secret: "daleu",
    resave: false,
    saveUninitialized: false
}))

app.get('/', (req, res) => {
  res.render('catalogo')
})

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});