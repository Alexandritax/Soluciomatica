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
const nodemailer = require("nodemailer");
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

  try {
    await sequelize.authenticate();
    const result = await neoSession.run(
      'MATCH(n:ANP) RETURN n'
    )
    const anpslist = []
    result.records.forEach(record => anpslist.push(record._fields[0].properties))
    //console.log("URL=" +result.records[0].get(0).properties.imagen)
    //console.log(anpslist)
    console.log('Connection with sequelize and neo4j has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  const anps = await neoSession.run(
    'MATCH(n:ANP) RETURN n'
  )
  const anpRecords = anps.records
  const anpList = []
  const imagen = anps.records[0].get(0).properties.imagen
  anpRecords.forEach(record => anpList.push(record._fields[0].properties))
  //console.log(anpList)
  res.render('catalogo',{anps:anpList,imagen:imagen})
})

app.get('/buy/:nombre', async(req,res) => {
  const nombre = req.params.nombre
  const anp = await neoSession.run(
    `Match(n:ANP) where n.nombre= $title return n`,
    {title: nombre})
  const currentANP = anp.records[0].get(0).properties
  const precio = currentANP.precio
  const imagen = currentANP.imagen
  const descripcion = currentANP.descripcion
  

  res.render('comprar',{
    nombre:nombre,
    precio:precio,
    imagen:imagen,
    descripcion:descripcion
  })
})

app.get('/finish/:nombre',async(req,res)=>{
  const nombre = req.params.nombre
  const anp = await neoSession.run(
    `Match(n:ANP) where n.nombre= $title return n`,
    {title: nombre})
  const currentANP = anp.records[0].get(0).properties
  const imagen = currentANP.imagen
  res.render('orden',{
    nombre: nombre,
    imagen: imagen
  })
  
})

app.post('/order/:nombre/:precio',async(req, res) => {
  try{
    let precio = req.params.precio
    let tickets = req.body.tickets
    let importe = precio*tickets
    let nombre = req.params.nombre
    const result = await neoSession.run(
      "Match (a:ANP) where a.nombre=$nombre "+
      "Create (a)-[nr:TIENE]->(b:BOLETO {reclut:$reclut})-[r:TIENE]->(p:PAGO {cantidad_boletos: $cantidad_boletos,total:$importe,reclut:$reclut}) "+
      "return a",
        {
          reclut: 'Alejandro',
          cantidad_boletos: tickets,
          importe:importe,
          nombre:nombre
        }
    )
    //console.log(result.records[0].get(0))
  } catch(err){
    console.error(err)
  }finally{
    const pago = await neoSession.run(
      'match (p:PAGO) where p.reclut=$reclut return p',
      {
        reclut:'Alejandro',
      }
    )
    console.log(pago.records[0].get(0))
    /* const restore = await neoSession.run(
      "match(n) where n.reclut=$reclut Detach delete n",
        {
          reclut: 'Alejandro'
        }
    ) */
  }
  const nombre = req.params.nombre
  const correo = req.params.correo
  /* 
  const anp = await neoSession.run(
    `Match(n:ANP) where n.nombre= $title return n`,
    {title: nombre})
  const currentANP = anp.records[0].get(0).properties
  const imagen = currentANP.imagen */
  res.redirect(`/finish/${nombre}`)
})

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});