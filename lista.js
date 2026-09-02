// ESTADO DE LA APP
// CONEXIÓN CON SUPABASE
const SUPABASE_URL = 'https://rkoiyuwbuhxktdrkazdh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_M4JShAaDtO_GtEsrNUpgKw_QpaGkJQQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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


// ===== REFERENCIAS A LAS TRES VISTAS =====
const vistaHabituales = document.getElementById('vista-habituales');
const vistaLista = document.getElementById('vista-lista');
const vistaMenu = document.getElementById('vista-menu');
const btnVolver = document.getElementById('btn-volver');
const btnVolverMenu = document.getElementById('btn-volver-menu');
const btnIrAMenu = document.getElementById('btn-ir-a-menu');


// ===== CAMBIAR ENTRE VISTAS =====
function ocultarTodasLasVistas() {
  vistaHabituales.style.display = 'none';
  vistaLista.style.display = 'none';
  vistaMenu.style.display = 'none';
}

function mostrarVistaLista() {
  ocultarTodasLasVistas();
  vistaLista.style.display = 'block';      // Mostramos la pantalla de la lista
}

function mostrarVistaHabituales() {
  ocultarTodasLasVistas();
  vistaHabituales.style.display = 'block'; // Mostramos la pantalla de habituales
}

function mostrarVistaMenu() {
  ocultarTodasLasVistas();
  vistaMenu.style.display = 'block';       // Mostramos la pantalla del menú semanal
}

btnVolver.addEventListener('click', mostrarVistaHabituales);
btnVolverMenu.addEventListener('click', mostrarVistaHabituales);
btnIrAMenu.addEventListener('click', mostrarVistaMenu);


// AÑADIR PRODUCTO A LA LISTA (función reutilizable)
async function agregarProducto(nombre) {
  nombre = nombre.trim();
  if (nombre === '') return;

  const yaExiste = productos.some(
    (producto) => producto.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (yaExiste) {
    alert('Ese producto ya está en la lista');
    return;
  }

  // Insertamos en Supabase y le pedimos que nos devuelva la fila creada
  const { data, error } = await supabaseClient
    .from('products')
    .insert({ name: nombre, purchased: false })
    .select()
    .single();

  if (error) {
    console.error('Error al añadir producto:', error);
    return;
  }

  // Usamos el id real que ha generado Supabase, no uno inventado en el navegador
  productos.push({
    id: data.id,
    nombre: data.name,
    comprado: data.purchased
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
async function alternarComprado(id) {
  const producto = productos.find((producto) => producto.id === id);
  const nuevoEstado = !producto.comprado;

  // Actualizamos primero en Supabase
  const { error } = await supabaseClient
    .from('products')
    .update({ purchased: nuevoEstado })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar producto:', error);
    return;
  }

  // Si ha ido bien, actualizamos también en memoria y redibujamos
  producto.comprado = nuevoEstado;
  pintarLista();
}


// ===== ELIMINAR UN PRODUCTO =====
async function eliminarProducto(id) {
  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar producto:', error);
    return;
  }

  productos = productos.filter((producto) => producto.id !== id);
  pintarLista();
}  


// ===== ELIMINAR TODOS LOS PRODUCTOS COMPRADOS =====
btnEliminarComprados.addEventListener('click', async () => {
  const idsAEliminar = productos
    .filter((producto) => producto.comprado)
    .map((producto) => producto.id);

  if (idsAEliminar.length === 0) return;

  const { error } = await supabaseClient
    .from('products')
    .delete()
    .in('id', idsAEliminar);

  if (error) {
    console.error('Error al eliminar comprados:', error);
    return;
  }

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

// ===== CARGAR PRODUCTOS DESDE SUPABASE AL ABRIR LA PÁGINA =====
async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al cargar productos:', error);
    return;
  }

  productos = data.map((fila) => ({
    id: fila.id,
    nombre: fila.name,
    comprado: fila.purchased
  }));

  pintarLista();
}

cargarProductos();


// =====================================================
// ============== MENÚ SEMANAL (COMIDA Y CENA) ========
// =====================================================
// No guardamos historial: solo existe una fila por día de la
// semana en la tabla "menu_semanal", y se va sobrescribiendo.

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const contenedorDiasMenu = document.getElementById('dias-menu');

// Guardamos aquí lo que hay en Supabase: { Lunes: {comida, cena}, ... }
let menuSemanal = {};


// ===== PINTAR LAS TARJETAS DE LOS 7 DÍAS =====
function pintarMenu() {
  contenedorDiasMenu.innerHTML = '';

  diasSemana.forEach((dia) => {
    const datosDia = menuSemanal[dia] || { comida: '', cena: '' };

    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-dia');

    const titulo = document.createElement('h3');
    titulo.textContent = dia;
    tarjeta.appendChild(titulo);

    // --- Fila de la comida ---
    const filaComida = document.createElement('div');
    filaComida.classList.add('fila-comida');

    const etiquetaComida = document.createElement('span');
    etiquetaComida.classList.add('etiqueta-comida');
    etiquetaComida.textContent = 'Comida';

    const inputComida = document.createElement('input');
    inputComida.type = 'text';
    inputComida.classList.add('input-comida');
    inputComida.placeholder = 'Ej: Lentejas';
    inputComida.value = datosDia.comida || '';
    inputComida.addEventListener('change', () => {
      guardarComidaODia(dia, 'comida', inputComida.value);
    });

    filaComida.appendChild(etiquetaComida);
    filaComida.appendChild(inputComida);
    tarjeta.appendChild(filaComida);

    // --- Fila de la cena ---
    const filaCena = document.createElement('div');
    filaCena.classList.add('fila-comida');

    const etiquetaCena = document.createElement('span');
    etiquetaCena.classList.add('etiqueta-comida');
    etiquetaCena.textContent = 'Cena';

    const inputCena = document.createElement('input');
    inputCena.type = 'text';
    inputCena.classList.add('input-comida');
    inputCena.placeholder = 'Ej: Tortilla';
    inputCena.value = datosDia.cena || '';
    inputCena.addEventListener('change', () => {
      guardarComidaODia(dia, 'cena', inputCena.value);
    });

    filaCena.appendChild(etiquetaCena);
    filaCena.appendChild(inputCena);
    tarjeta.appendChild(filaCena);

    contenedorDiasMenu.appendChild(tarjeta);
  });
}


// ===== GUARDAR UN CAMPO (COMIDA O CENA) DE UN DÍA CONCRETO =====
async function guardarComidaODia(dia, campo, valor) {
  // Actualizamos primero en memoria para que la app no se sienta lenta
  if (!menuSemanal[dia]) {
    menuSemanal[dia] = { comida: '', cena: '' };
  }
  menuSemanal[dia][campo] = valor;

  // "upsert": si la fila del día ya existe la actualiza, si no existe la crea
  // onConflict: 'dia' le dice a Supabase que el día es la clave única
  const { error } = await supabaseClient
    .from('menu_semanal')
    .upsert({ dia: dia, [campo]: valor }, { onConflict: 'dia' });

  if (error) {
    console.error('Error al guardar el menú:', error);
  }
}


// ===== CARGAR EL MENÚ DESDE SUPABASE =====
async function cargarMenu() {
  const { data, error } = await supabaseClient
    .from('menu_semanal')
    .select('*');

  if (error) {
    console.error('Error al cargar el menú:', error);
    return;
  }

  menuSemanal = {};
  data.forEach((fila) => {
    menuSemanal[fila.dia] = { comida: fila.comida, cena: fila.cena };
  });

  pintarMenu();
}

cargarMenu();