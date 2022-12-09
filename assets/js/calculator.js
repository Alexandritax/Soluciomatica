const calcular = (ticket) => {
    const precio = document.getElementById("precio")
    const quantity = document.getElementById("ticket")
    const importe = document.getElementById("importe")
    if(quantity.value <=0){
        quantity.value = 1
    }
    importe.innerText = parseInt(precio.innerText) * parseInt(quantity.value)
    
}

const calcularNoObstrusivo = (evt) => {
    const select = evt.target;
    const value = select.value;

    calcular(value)
}



const main =() => {
    let ticket = document.getElementById('ticket')
    ticket.addEventListener("change",calcularNoObstrusivo)
}

window.addEventListener("load",main)