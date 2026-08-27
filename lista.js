// ESTADO DE LA APP

// Array donde guardamos temporalmente los productos (más adelante vendrá de Supabase)
let productos = [];


// REFERENCIAS A ELEMENTOS DEL HTML
// Guardamos en variables los elementos del HTML con los que vamos a trabajar

const formulario = document.getElementById('formulario');           // El <form> que contiene el input
const inputProducto = document.getElementById('input-producto');    // El campo de texto donde escribes el producto
const listaProductos = document.getElementById('lista-productos');  // El <ul> donde se muestran los productos
const contador = document.getElementById('contador');               // El <p> que muestra cuántos quedan pendientes
const btnEliminarComprados = document.getElementById('btn-eliminar-comprados'); // El botón rojo


// PRODUCTOS HABITUALES (para seleccionar y añadir en bloque)
const productosHabituales = ['Leche', 'Patatas', 'Huevos', 'Pollo', 'Tomate', 'Colacao', 'Ternera', 'Fruta', 'Pescado', 'Queso', 'Yogur', 'Gel', 'Champú', 'Acondicionador'];

const contenedorHabituales = document.getElementById('productos-habituales');
const btnIrALista = document.getElementById('btn-ir-a-lista');
const contadorSeleccionados = document.getElementById('contador-seleccionados');

// Array donde guardamos los nombres que el usuario ha ido marcando como "necesito comprarlo"
// (todavía NO están en la lista de la compra, solo están "apuntados")
let seleccionados = [];


// ===== REFERENCIAS A LAS DOS VISTAS =====
const vistaHabituales = document.getElementById('vista-habituales');
const vistaLista = document.getElementById('vista-lista');
const btnVolver = document.getElementById('btn-volver');


// ===== CAMBIAR ENTRE VISTAS =====
function mostrarVistaLista() {
  vistaHabituales.style.display = 'none'; // Ocultamos la pantalla de habituales
  vistaLista.style.display = 'block';      // Mostramos la pantalla de la lista
}

function mostrarVistaHabituales() {
  vistaLista.style.display = 'none';       // Ocultamos la pantalla de la lista
  vistaHabituales.style.display = 'block'; // Mostramos la pantalla de habituales
}

btnVolver.addEventListener('click', mostrarVistaHabituales);


// AÑADIR PRODUCTO A LA LISTA (función reutilizable)
function agregarProducto(nombre) {
  nombre = nombre.trim();
  // Quita espacios sobrantes al principio/final

  if (nombre === '') return;
  // Si está vacío, no hacemos nada

  const yaExiste = productos.some(
    (producto) => producto.nombre.toLowerCase() === nombre.toLowerCase()
  );
  // Comprobamos si ya existe (sin distinguir mayúsculas/minúsculas)

  if (yaExiste) {
    alert('Ese producto ya está en la lista');
    return;
  }

  // Usamos crypto.randomUUID() para generar un id verdaderamente único 
  productos.push({
    id: crypto.randomUUID(), 
    nombre: nombre,
    comprado: false
  });

  pintarLista();
}

// ===== EVENTO DEL FORMULARIO (input manual + Enter) =====
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  // Evita que la página se recargue al enviar el formulario

  if (inputProducto.value.trim() === '') return;
  // Evita añadir productos en blanco

  agregarProducto(inputProducto.value);
  // Reutilizamos la misma función que se usa al confirmar los seleccionados

  inputProducto.value = '';
  // Limpiamos el input después de añadir (y nos quedamos en esta pantalla)
});


// ===== MARCAR / DESMARCAR UN PRODUCTO HABITUAL =====
function alternarSeleccionado(nombre) {
  if (seleccionados.includes(nombre)) {
    seleccionados = seleccionados.filter((item) => item !== nombre);
  } else {
    seleccionados.push(nombre);
  }

  pintarHabituales();
  actualizarBotonIrALista();
}


// ===== PINTAR LOS BOTONES DE PRODUCTOS HABITUALES =====
function pintarHabituales() {
  contenedorHabituales.innerHTML = '';

  productosHabituales.forEach((nombre) => {
    const boton = document.createElement('button');
    boton.textContent = seleccionados.includes(nombre) ? `✓ ${nombre}` : `+ ${nombre}`;
    boton.classList.add('boton-habitual');

    if (seleccionados.includes(nombre)) {
      boton.classList.add('seleccionado');
    }

    boton.addEventListener('click', () => alternarSeleccionado(nombre));
    contenedorHabituales.appendChild(boton);
  });
}

pintarHabituales();


// ===== MOSTRAR/OCULTAR Y ACTUALIZAR EL BOTÓN "IR A LA LISTA" =====
function actualizarBotonIrALista() {
  // NUEVO: Calculamos los pendientes que ya están en la lista real
  const pendientesEnLista = productos.filter((producto) => !producto.comprado).length;
  
  // NUEVO: Sumamos los botones marcados + los productos escritos a mano
  const total = seleccionados.length + pendientesEnLista;

  // Actualizamos el número que muestra el botón
  contadorSeleccionados.textContent = total;

  if (total > 0) {
    btnIrALista.style.display = 'block';
    // Mostramos el botón si hay ALGO (ya sea seleccionado o escrito)
  } else {
    btnIrALista.style.display = 'none';
    // Lo ocultamos si la lista está vacía por completo
  }
}


// ===== EVENTO DEL BOTÓN "IR A LA LISTA DE LA COMPRA" =====
btnIrALista.addEventListener('click', () => {
  seleccionados.forEach((nombre) => agregarProducto(nombre));
  // Añadimos a la lista de la compra cada producto que estaba seleccionado

  seleccionados = [];
  // Vaciamos la selección, ya se han añadido todos

  pintarHabituales();
  // Redibujamos los botones habituales (vuelven a su estado normal, sin check)

  actualizarBotonIrALista();
  // Actualizamos el botón de nuevo

  mostrarVistaLista();
  // Navegamos a la pantalla de la lista de la compra
});


// ===== MARCAR / DESMARCAR PRODUCTO COMO COMPRADO =====
function alternarComprado(id) {
  const producto = productos.find((producto) => producto.id === id);
  producto.comprado = !producto.comprado;
  pintarLista();
}


// ===== ELIMINAR UN PRODUCTO =====
function eliminarProducto(id) {
  productos = productos.filter((producto) => producto.id !== id);
  pintarLista();
}


// ===== ELIMINAR TODOS LOS PRODUCTOS COMPRADOS =====
btnEliminarComprados.addEventListener('click', () => {
  productos = productos.filter((producto) => !producto.comprado);
  pintarLista();
});


// ===== DIBUJAR LA LISTA EN PANTALLA =====
function pintarLista() {
  listaProductos.innerHTML = '';

  productos.forEach((producto) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = producto.comprado;
    checkbox.addEventListener('change', () => alternarComprado(producto.id));

    const texto = document.createElement('span');
    texto.textContent = producto.nombre;

    if (producto.comprado) {
      texto.classList.add('comprado');
    }

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = '✕';
    btnEliminar.addEventListener('click', () => eliminarProducto(producto.id));

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(btnEliminar);

    listaProductos.appendChild(li);
  });

  actualizarContador();
  actualizarBotonIrALista(); 
  // NUEVO: Cada vez que redibujamos la lista (ej: al añadir un producto manual), 
  // forzamos a que el botón "Ir a la lista" se actualice.
}


// ===== ACTUALIZAR EL CONTADOR DE PENDIENTES =====
function actualizarContador() {
  const pendientes = productos.filter((producto) => !producto.comprado).length;
  contador.textContent = `${pendientes} producto${pendientes !== 1 ? 's' : ''} pendiente${pendientes !== 1 ? 's' : ''}`;
}