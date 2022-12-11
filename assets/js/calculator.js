
/*  this function helps to calculate the total import of the tickets
    and updates the values into the page itself 
*/
const calcular = (ticket) => {
    const precio = document.getElementById("precio")
    const quantity = ticket
    const importe = document.getElementById("importe")
    const importehtml = document.getElementById("importehtml")
    if(quantity.value <=0){
        quantity.value = 1
    }
    let res = parseInt(precio.innerText) * quantity
    importe.innerText = res
    importehtml.value = res
    //console.log(importehtml.value)
}

/*  This function is used to avoid intruding into the html by looking at the event itself */
const calcularNoObstrusivo = (evt) => {
    const select = evt.target;
    const value = select.value;
    calcular(value)
}


/*  This main function sets a listener into the object */
const main =() => {
    let ticket = document.getElementById('ticket')
    ticket.addEventListener("change",calcularNoObstrusivo)
}
 /* Sets the function main to load at the beginning of the window*/
window.addEventListener("load",main)