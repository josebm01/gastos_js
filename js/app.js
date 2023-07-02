//? Variables y selectores
const formulario = document.querySelector('#agregar-gasto')
const gastoListado = document.querySelector('#gastos ul')
let presupuesto

const AL = {
    ERROR: 'error',
    MSG_OBLI: 'Ambos campos son obligatorios',
    MSG_CANT: 'Cantidad no válida',
    MSG_CORR: 'Gasto agregado correctamente',
    MSG_PR_AGO: 'El presupuesto se ha agotado' 
}


//? Clases 
class Presupuesto{
    constructor( presupuesto ){
        this.presupuesto = Number(presupuesto)
        this.restante = Number(presupuesto)
        this.gastos = []
    }

    nuevoGasto( gasto ){
        this.gastos = [ ...this.gastos, gasto ]
        this.calcularRestante()        
    }

    calcularRestante(){
        // Obteniendo el resultado iterando sobre el arreglo obteniendo el total, inicia en 0
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0)
        this.restante = this.presupuesto - gastado         
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id )
        this.calcularRestante()
    }
}

class UI{
    insertarPresupuesto( cantidad ){
        // Extrayendo los valores 
        const { presupuesto, restante } = cantidad
        
        // Agregando al HTML
        document.querySelector('#total').textContent = presupuesto
        document.querySelector('#restante').textContent = restante
    }

    imprimirAlerta( mensaje, tipo ){

        // Crear div
        const divMensaje = document.createElement('div')
        divMensaje.classList.add('text-center', 'alert')
        
        // Validando tipo de mensaje
        if ( tipo === 'error' ){
            divMensaje.classList.add('alert-danger')
        } else {
            divMensaje.classList.add('alert-success')
        }

        // Mensaje de error
        divMensaje.textContent = mensaje

        // Insertar en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario)

        setTimeout(() => {
            divMensaje.remove()
        }, 3000);

    }


    mostrarGastos( gastos ){

        // Eliminando elementos previos del listado
        this.limpiarHTML()

        // Iterando sobre los gastos 
        gastos.forEach( gasto => {
            const { cantidad, nombre, id } = gasto
            
            // Crear LI
            const nuevoGasto = document.createElement('li')
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center' // Name solo las clases que hay y se pueden agregar un valor diferente
            nuevoGasto.dataset.id = id // Agrega el data set en el html -> data- y el punto es lo que tendrá, en este caso data-id

            // Agregar HTML del gasto
            nuevoGasto.innerHTML = ` ${nombre} <span class="badge badge-primary badge-pill">$${ cantidad }</span>`

            // Botón para borrar el gasto
            const btnBorrar = document.createElement('button')
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto')
            btnBorrar.innerHTML = 'Borrar &times'
            btnBorrar.onclick = () => {
                eliminarGasto(id)
            }
            nuevoGasto.appendChild(btnBorrar)

            // Agregar HTML
            gastoListado.appendChild(nuevoGasto)

        })
    
    }


    actualizarRestante( restante ){
        document.querySelector('#restante').textContent = restante
    }


    comprobarPresupuesto( presupuestoObj ){
        const { presupuesto, restante } = presupuestoObj
        const restanteDiv = document.querySelector('.restante')

        if ( (presupuesto / 4) > restante ) { // Comprobando 25% gastado
            restanteDiv.classList.remove('alert-success', 'alert-warning')
            restanteDiv.classList.add('alert-danger')
        } else if ( (presupuesto / 2) > restante ){ // Mitad de cantidad restante
            restanteDiv.classList.remove('alert-success')
            restanteDiv.classList.add('alert-warning')
        } else { // Cantidad de reembolso
            restanteDiv.classList.remove('alert-danger', 'alert-warning')
            restanteDiv.classList.add('alert-success')
        }

        // Si el total es 0 o menor
        if ( restante <= 0 ){
            ui.imprimirAlerta( AL.MSG_PR_AGO, AL.ERROR)
            
            // Inhabilitar botón para agregar más gastos
            formulario.querySelector('button[type="submit"]').disabled = true 
        }
    }


    limpiarHTML(){
        while( gastoListado.firstChild ){
            gastoListado.removeChild(gastoListado.firstChild)
        }       
    }

}



// Instanciar
const ui = new UI()



//? Funciones
const preguntarPresupuesto = () => {
    const presupuestoUsuario = prompt('¿Cuá es tu presupuesto?')
    
    if ( presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ){
        window.location.reload()
    }

    // Presupuesto válido
    presupuesto = new Presupuesto(presupuestoUsuario)
    console.log( presupuesto )

    ui.insertarPresupuesto(presupuesto)
}


// Añade gastos
const agregarGasto = (e) => {

    e.preventDefault()

    // Leer datos del formulario
    const nombre = document.querySelector('#gasto').value
    const cantidad = Number(document.querySelector('#cantidad').value)

    // Validando valores
    if ( nombre === '' || cantidad === '' ){
    
        ui.imprimirAlerta(AL.MSG_OBLI, AL.ERROR)
        return

    } else if ( cantidad <= 0 || isNaN(cantidad) ) {
    
        ui.imprimirAlerta(AL.MSG_CANT, AL.ERROR)
        return
    
    }

    // Generar objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() }

    // Añade un nuevo gasto 
    presupuesto.nuevoGasto(gasto)

    // Mensaje correctamente
    ui.imprimirAlerta(AL.MSG_CORR)

    // Imprimir gastos
    const { gastos, restante } = presupuesto
    
    // Llamando funciones del objeto ui
    ui.mostrarGastos( gastos )
    ui.actualizarRestante( restante )
    ui.comprobarPresupuesto( presupuesto )

    // Reseteando valores del formulario
    formulario.reset()

}




const eliminarGasto = (id) => {
    // Elimina gastos del objeto
    presupuesto.eliminarGasto(id)

    // Eliinando los gastos del HTML
    const { gastos, restante } = presupuesto
    ui.mostrarGastos( gastos )
    ui.actualizarRestante( restante )
    ui.comprobarPresupuesto( presupuesto )
}



//? Eventos 
const eventListeners = () => {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto)
    formulario.addEventListener('submit', agregarGasto)
}


//? Llamando eventos
eventListeners()    


