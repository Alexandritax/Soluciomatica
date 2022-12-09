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

const neo4j = require('neo4j-driver')
const driver = neo4j.driver('neo4j+s://bd720e6b.databases.neo4j.io', neo4j.auth.basic('postulante', 'solucionatica2022'))
const neoSession = driver.session()
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
    const result = await neoSession.run(
      'MATCH(n) RETURN n'
    )
    console.log(result.records[0].get(0))
    console.log('Connection with sequelize and neo4j has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});