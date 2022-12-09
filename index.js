const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session')

const { render } = require('ejs');
const { Sequelize } = require('sequelize');


const port = 3000;
const sequelize = new Sequelize('postgres', 'postulante', 'solucionatica2022', {
  host: 'reclutamiento-instance-1.cgcdn4lykdst.us-east-1.rds.amazonaws.com',
  dialect: 'postgres'
});

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

app.get('/', async(req, res) => {
  res.render('catalogo')
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});