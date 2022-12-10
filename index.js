const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session')
const { render } = require('ejs');


const port = 3000;

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
    const anps = await neoSession.run(
      'MATCH(n:ANP) RETURN n'
    )
    const anpRecords = anps.records
    const anpList = []
    const imagen = anps.records[0].get(0).properties.imagen
    anpRecords.forEach(record => anpList.push(record._fields[0].properties))
    res.render('catalogo',{anps:anpList,imagen:imagen})
    console.log('Connection with neo4j has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
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
    let tickets = req.body.tickets
    let importe = req.body.importe
    let nombre = req.params.nombre
    const result = await neoSession.run(
      "Match (a:ANP) where a.nombre=$nombre "+
      "Create (a)-[nr:TIENE]->(b:BOLETO {reclut:$reclut})-[r:TIENE]->(p:PAGO {cantidad_boletos: $cantidad_boletos,total:$importe,reclut:$reclut}) "+
      "return p",
        {
          reclut: 'Alejandro',
          cantidad_boletos: tickets,
          importe:importe,
          nombre:nombre
        }
    )
    const currentANP =  result.records[0].get(0).properties
    let boletos = currentANP.cantidad_boletos
    let total = currentANP.total
    console.log(`Se efectuo la transaccion de ${boletos} por un total de ${total}`)
  } catch(err){
    console.error('Nuevo error\n'+err)
  }finally{
    let nombre = req.params.nombre
    res.redirect(`/finish/${nombre}`)
  }
  const correo = req.body.correo
})

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});