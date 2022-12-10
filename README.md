# Soluciomatica

Es crucial el archivo .env, el cual no se encuentra incluido en este repositorio por seguridad.

Instrucciones para la ejecucion de este proyecto una vez descargado
1. En la consola ejecutar los comandos
  - npm install
2. Para inicar el proyecto utilizar los comandos
  - esto permite la edicion del codigo npm run start:dev
  - Inicializacion normal npm run start
3. Acceder desde un explorador a la url http://localhost:3000/

Requerimientos por cumplir
1. Primera pantalla
  - [x] El usuario podrá visualizar un catálogo de ANPs cuya data será cargada desde un servidor.
  - [x] Cada ítem (elemento del catálogo) debe mostrar el nombre, la imagen, precio de boleto y un botón de compra.
  - [x] El botón debe redireccionar al usuario a la pantalla de compra al hacerle click.
2. Segunda pantalla
  - [x] En la página de compra, el usuario observará el detalle de la ANP que ha seleccionado, mostrando su nombre, imagen y descripción.
  - [x] El usuario podrá seleccionar el número de boletos a comprar y, de acuerdo a la cantidad seleccionada.
  - [x] Se debe mostrar el monto total correspondiente.
  - [x] Al hacer click al botón de pago, se debe guardar registro de la orden y se debe redireccionar al usuario a la siguiente pantalla. 
3. Tercera pantalla
  - [x] En la pantalla de confirmación, se mostrará un mensaje de éxito y se redirigirá al usuario a la pantalla del catálogo inicial.
4. Deseables
  - [x] Al efectuar una compra, se enviará un correo a cualquier destinatario con los detalles de la compra. ref:https://www.youtube.com/watch?v=-rcRf7yswfM&t=845s
  - [x] Utilizar la base de datos Neo4J para el consumo de las APIs.
