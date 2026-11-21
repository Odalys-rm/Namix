// ===== Menú de géneros (abrir / cerrar) =====
document.querySelectorAll(".genero-titulo").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lista = btn.nextElementSibling;
    const abierto = !lista.hidden;
    lista.hidden = abierto;
    btn.setAttribute("aria-expanded", String(!abierto));
    btn.querySelector(".signo").textContent = abierto ? "+" : "–";
  });
});

// El botón Registrarse lleva al formulario y enfoca el primer campo
document.getElementById("btn-registro").addEventListener("click", () => {
  setTimeout(() => document.getElementById("nombre").focus(), 300);
});

// ===== Configuración del formulario =====
const ANIO_MIN = 1900;
const ANIO_MAX = 2022;
const LARGO_TARJETA = 16;      // cambia este número si quieres otra longitud
const MAX_LETRAS_EMAIL = 80;
const MAX_NUMEROS_EMAIL = 80;
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const $ = (id) => document.getElementById(id);
const campos = {
  nombre: $("nombre"), paterno: $("paterno"), materno: $("materno"),
  edad: $("edad"), tarjeta: $("tarjeta"), email: $("email"),
  dia: $("dia"), mes: $("mes"), anio: $("anio")
};
const boton = $("validar");
const ayuda = $("ayuda");
const modal = $("modal");
const tocados = new Set();
let intentoEnvio = false;

// ===== Llenar la fecha de nacimiento =====
for (let d = 1; d <= 31; d++) campos.dia.add(new Option(d, d));
MESES.forEach((m, i) => campos.mes.add(new Option(m, i + 1)));
for (let a = ANIO_MAX; a >= ANIO_MIN; a--) campos.anio.add(new Option(a, a));

// ===== Filtros de escritura =====
const SOLO_LETRAS = /[^A-ZÁÉÍÓÚÜÑ ]/g;

function limpiarNombre(v) {
  return v.toUpperCase().replace(SOLO_LETRAS, "").replace(/^ +/, "").slice(0, 100);
}

function filtrar(input, filtro) {
  const pos = input.selectionStart;
  const antes = filtro(input.value.slice(0, pos));
  input.value = filtro(input.value);
  try { input.setSelectionRange(antes.length, antes.length); } catch (e) {}
}

["nombre", "paterno", "materno"].forEach((id) =>
  campos[id].addEventListener("input", () => filtrar(campos[id], limpiarNombre)));

campos.edad.addEventListener("input", () =>
  filtrar(campos.edad, (v) => v.replace(/\D/g, "").slice(0, 3)));

campos.tarjeta.addEventListener("input", () =>
  filtrar(campos.tarjeta, (v) => v.replace(/\D/g, "").slice(0, LARGO_TARJETA)));

campos.email.addEventListener("input", () =>
  filtrar(campos.email, (v) => v.replace(/\s/g, "")));

// ===== Fecha y edad =====
function fechaCompleta() {
  return campos.dia.value && campos.mes.value && campos.anio.value;
}

function fechaValida() {
  if (!fechaCompleta()) return false;
  const d = +campos.dia.value, m = +campos.mes.value, a = +campos.anio.value;
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
}

function edadReal() {
  const hoy = new Date();
  const d = +campos.dia.value, m = +campos.mes.value, a = +campos.anio.value;
  let edad = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad;
}

function esMenor() {
  return fechaValida() && edadReal() < 18;
}

// ===== Validaciones =====
function contarVocales(t) {
  return (t.match(/[AEIOUÁÉÍÓÚÜ]/g) || []).length;
}

function validarNombre(valor, minVocales, etiqueta) {
  if (!valor.trim()) return `Escribe ${etiqueta}.`;
  if (valor.length > 100) return "Máximo 100 letras.";
  if (contarVocales(valor) < minVocales) {
    return minVocales === 1
      ? "El nombre debe tener al menos una vocal."
      : `${etiqueta[0].toUpperCase() + etiqueta.slice(1)} debe tener al menos dos vocales.`;
  }
  return "";
}

const validadores = {
  nombre: () => validarNombre(campos.nombre.value, 1, "tu nombre"),
  paterno: () => validarNombre(campos.paterno.value, 2, "tu apellido paterno"),
  materno: () => validarNombre(campos.materno.value, 2, "tu apellido materno"),

  edad() {
    const v = campos.edad.value;
    if (!v) return "Escribe tu edad.";
    if (!/^\d{1,3}$/.test(v)) return "La edad solo acepta números (máximo 3).";
    if (fechaValida() && +v !== edadReal()) {
      return `La edad no coincide con tu fecha de nacimiento (según la fecha tienes ${edadReal()} años).`;
    }
    return "";
  },

  fecha() {
    if (!fechaCompleta()) return "Elige día, mes y año de nacimiento.";
    if (!fechaValida()) return "Esa fecha no existe (revisa el día y el mes).";
    return "";
  },

  tarjeta() {
    if (esMenor()) return "";
    const v = campos.tarjeta.value;
    if (!v) return "Escribe tu número de tarjeta.";
    if (!/^\d+$/.test(v)) return "El número de tarjeta solo acepta números.";
    if (v.length < LARGO_TARJETA) return `La tarjeta debe tener ${LARGO_TARJETA} números (llevas ${v.length}).`;
    return "";
  },

  email() {
    const v = campos.email.value;
    if (!v) return "Escribe tu correo electrónico.";
    const letras = (v.match(/[A-Za-z]/g) || []).length;
    const numeros = (v.match(/\d/g) || []).length;
    if (letras > MAX_LETRAS_EMAIL) return `Máximo ${MAX_LETRAS_EMAIL} letras.`;
    if (numeros > MAX_NUMEROS_EMAIL) return `Máximo ${MAX_NUMEROS_EMAIL} números.`;

    const partes = v.split("@");
    if (partes.length < 2) return "Falta el @ (ejemplo: usuario@gmail.com).";
    if (partes.length > 2) return "El correo solo puede tener un @.";
    const [local, dominio] = partes;
    if (!local) return "Falta el nombre antes del @.";
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
      return "El nombre antes del @ tiene caracteres no válidos.";
    }
    if (!dominio) return "Falta el dominio después del @ (ejemplo: gmail.com).";
    if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(dominio) || /(^|\.)-|-(\.|$)/.test(dominio)) {
      return "El dominio no es válido (ejemplo: gmail.com o t-systems.mx).";
    }
    return "";
  }
};

// ===== Mostrar errores =====
function mostrar(clave, errorId, mensaje) {
  const caja = $(errorId);
  const campo = caja.closest(".campo");
  const visible = intentoEnvio || tocados.has(clave);
  caja.textContent = visible ? mensaje : "";
  campo.classList.toggle("invalido", visible && !!mensaje);
}

function revisar() {
  const errores = {
    nombre: validadores.nombre(),
    paterno: validadores.paterno(),
    materno: validadores.materno(),
    edad: validadores.edad(),
    fecha: validadores.fecha(),
    tarjeta: validadores.tarjeta(),
    email: validadores.email()
  };
  Object.keys(errores).forEach((k) => mostrar(k, `error-${k}`, errores[k]));
  return errores;
}

// ===== Tarjeta bloqueada para menores =====
function actualizarTarjeta() {
  const menor = esMenor();
  campos.tarjeta.disabled = menor;
  if (menor) {
    campos.tarjeta.value = "";
    campos.tarjeta.placeholder = "No necesario para menores de edad";
  } else {
    campos.tarjeta.placeholder = `${LARGO_TARJETA} dígitos`;
  }
}

// ===== Botón Validar =====
function todoRelleno() {
  const base = ["nombre", "paterno", "materno", "edad", "email", "dia", "mes", "anio"]
    .every((k) => campos[k].value.trim() !== "");
  const tarjetaOk = esMenor() || campos.tarjeta.value.trim() !== "";
  return base && tarjetaOk;
}

function actualizar() {
  actualizarTarjeta();
  const lleno = todoRelleno();
  boton.disabled = !lleno;
  ayuda.textContent = lleno
    ? "Presiona Validar para revisar tus datos."
    : "Completa todos los campos para poder validar.";
  revisar();
}

// ===== Eventos =====
Object.entries(campos).forEach(([clave, el]) => {
  const grupo = ["dia", "mes", "anio"].includes(clave) ? "fecha" : clave;
  el.addEventListener("input", () => { tocados.add(grupo); actualizar(); });
  el.addEventListener("change", () => { tocados.add(grupo); actualizar(); });
  el.addEventListener("blur", () => { tocados.add(grupo); revisar(); });
});

$("formulario").addEventListener("submit", (e) => {
  e.preventDefault();
  intentoEnvio = true;
  const errores = revisar();
  if (Object.values(errores).some((m) => m !== "")) {
    const primero = document.querySelector(".campo.invalido");
    if (primero) primero.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (esMenor()) {
    abrirModal("¡Eres menor de edad!", "Ajustaremos las canciones según tu edad.");
  } else {
    abrirModal("¡Datos Correctos!", "Tus datos han sido guardados.");
  }
});

function abrirModal(titulo, texto) {
  $("modal-titulo").textContent = titulo;
  $("modal-texto").textContent = texto;
  modal.hidden = false;
  $("modal-cerrar").focus();
}

function cerrarModal() { modal.hidden = true; }
$("modal-cerrar").addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });

actualizar();
