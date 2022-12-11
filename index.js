require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser')
const { render } = require('ejs');
const port = process.env.PORT || 3000;

const neo4j = require('neo4j-driver')

const NEO4J_URL = process.env.NEO4J_URL
const NEO4J_USERNAME =  process.env.NEO4J_USERNAME
const NEO4J_PASSWORD =  process.env.NEO4J_PASSWORD

const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD))
const neoSession = driver.session()
const app = express();
const nodemailer = require("nodemailer");
const {google} = require('googleapis')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials( {refresh_token: REFRESH_TOKEN})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('assets')) // soporte de archivos estaticos
app.set('view engine', 'ejs') // Configuramos el motor de templates

//Pantalla inicial
app.get('/', async(req, res) => {
  try {
    //Cypher para obtener nodos ANP
    const anps = await neoSession.run(
      'MATCH(n:ANP) RETURN n'
    )
    const anpRecords = anps.records
    const anpList = []
    const imagen = anps.records[0].get(0).properties.imagen
    anpRecords.forEach(record => anpList.push(record._fields[0].properties))
    console.log(anpList)
    res.render('catalogo',{anps:anpList,imagen:imagen})
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})

//Segunda pantalla
app.get('/buy/:nombre', async(req,res) => {
  try{
    const nombre = req.params.nombre
    //Cypher para encontrar el nodo seleccionado
    const anp = await neoSession.run(
      `Match(n:ANP) where n.nombre= $title return n`,
      {title: nombre})
    const currentANP = anp.records[0].get(0).properties
    const precio = currentANP.precio
    const imagen = currentANP.imagen
    const descripcion = currentANP.descripcion
    
    //Se renderiza la pagina
    res.render('comprar',{
      nombre:nombre,
      precio:precio,
      imagen:imagen,
      descripcion:descripcion
    })
  } catch (e) {
    console.error(e)
  }
})

app.get('/finish/:nombre',async(req,res)=>{
  try{
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
  } catch (e) {
    console.error(e)
  }
  
})

app.post('/order/:nombre',async(req, res) => {
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
    console.log(`Se efectuo la transaccion de ${boletos} por un total de ${total} soles`)
  } catch(err){
    console.error('Nuevo error\n'+err)
  }finally{
    let tickets = req.body.tickets
    let importe = req.body.importe
    let nombre = req.params.nombre
    let correo = req.body.correo
    try{
      if(isEmail(correo)){
        sendemail(correo,tickets,nombre,importe)
      }
    }catch(err){
      console.error(err)
    }
    res.redirect(`/finish/${nombre}`)
  }
  
  
})

function isEmail(emailAdress){
  let regex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  return !!(emailAdress.match(regex));
}

async function sendemail(destinatario,tickets,nombre,importe) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //let testAccount = await nodemailer.createTestAccount();

  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const config = {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'silvasolisdelbarrio@gmail.com',
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      }

    let transporter = nodemailer.createTransport(config)

    const mensaje = {
      from: 'Soluciomatica <silvasolisdelbarrio@gmail.com>', // sender address
      to: destinatario, // list of receivers
      subject: "Transaccion exitosa",
      text: `La transaccion de sus ${tickets} boletos para ${nombre} ha sido exitosa. El importe total fue de ${importe}.`, // plain text body
    }

    let info = await transporter.sendMail(mensaje);
    console.log("Message sent: %s", info.messageId);
  }catch(e) {
    console.error(e);
  }

}

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});