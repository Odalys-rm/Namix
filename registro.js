const formulario = document.getElementById("formulario");
const botonValidar = document.getElementById("botonValidar");
const notificacion = document.getElementById("notificacion");

const camposTexto = ["nombre", "paterno", "materno"];

camposTexto.forEach((id) => {
  const campo = document.getElementById(id);

  campo.addEventListener("input", () => {
    const posicion = campo.selectionStart;
    const valor = campo.value
      .toLocaleUpperCase("es-MX")
      .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, "")
      .slice(0, 100);

    campo.value = valor;
    campo.setSelectionRange(
      Math.min(posicion, valor.length),
      Math.min(posicion, valor.length)
    );
    actualizarBoton();
  });
});

const edad = document.getElementById("edad");
edad.addEventListener("input", () => {
  edad.value = edad.value.replace(/\D/g, "").slice(0, 3);
  actualizarBoton();
});

const telefono = document.getElementById("telefono");
telefono.addEventListener("input", () => {
  const numeros = telefono.value.replace(/\D/g, "").slice(0, 10);
  let formato = numeros;

  if (numeros.length > 6) {
    formato = numeros.slice(0, 3) + " " + numeros.slice(3, 6) + " " + numeros.slice(6);
  } else if (numeros.length > 3) {
    formato = numeros.slice(0, 3) + " " + numeros.slice(3);
  }

  telefono.value = formato;
  actualizarBoton();
});

const email = document.getElementById("email");
email.addEventListener("input", actualizarBoton);

function actualizarBoton() {
  const ids = ["nombre", "paterno", "materno", "edad", "telefono", "email"];
  botonValidar.disabled = !ids.every((id) =>
    document.getElementById(id).value.trim() !== ""
  );
}

function mostrarError(id, mensaje) {
  const campo = document.getElementById(id);
  document.getElementById("error-" + id).textContent = mensaje;
  campo.classList.toggle("invalido", mensaje !== "");
}

function validarTexto(id, minimoVocales, etiqueta) {
  const valor = document.getElementById(id).value.trim();

  if (!valor) {
    mostrarError(id, "Este campo es obligatorio.");
    return false;
  }

  if (!/^[A-ZÁÉÍÓÚÜÑ]+(?:\s+[A-ZÁÉÍÓÚÜÑ]+)*$/i.test(valor)) {
    mostrarError(id, "Usa solamente letras y espacios; no números ni caracteres especiales.");
    return false;
  }

  const cantidadVocales = (valor.match(/[AEIOUÁÉÍÓÚÜ]/gi) || []).length;
  if (cantidadVocales < minimoVocales) {
    mostrarError(id, minimoVocales === 1
      ? "Debe contener al menos una vocal."
      : "Debe contener al menos dos vocales.");
    return false;
  }

  mostrarError(id, "");
  return true;
}

function validarEdad() {
  if (!/^\d{1,3}$/.test(edad.value)) {
    mostrarError("edad", "Escribe solamente números (máximo 3 dígitos).");
    return false;
  }
  mostrarError("edad", "");
  return true;
}

function validarTelefono() {
  const numeros = telefono.value.replace(/\s/g, "");
  if (!/^\d{10}$/.test(numeros)) {
    mostrarError("telefono", "El teléfono debe contener exactamente 10 números.");
    return false;
  }
  mostrarError("telefono", "");
  return true;
}

function validarEmail() {
  const valor = email.value.trim();
  const estructura = /^[A-Z0-9.!#$%&'*+/?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

  if (!valor) {
    mostrarError("email", "El correo electrónico es obligatorio.");
    return false;
  }

  const partes = valor.split("@");
  if (partes.length !== 2 || partes[0].length > 80 || partes[1].length > 80) {
    mostrarError("email", "Debe tener un solo @ y máximo 80 caracteres antes y después.");
    return false;
  }

  if (!estructura.test(valor)) {
    mostrarError("email", "Escribe un correo válido, por ejemplo nombre@gmail.com o usuario@t-systems.mx.");
    return false;
  }

  mostrarError("email", "");
  return true;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const valido = [
    validarTexto("nombre", 1, "El nombre"),
    validarTexto("paterno", 2, "El apellido paterno"),
    validarTexto("materno", 2, "El apellido materno"),
    validarEdad(),
    validarTelefono(),
    validarEmail()
  ].every(Boolean);

  if (valido) {
    notificacion.classList.add("mostrar");
    window.setTimeout(() => notificacion.classList.remove("mostrar"), 3500);
  } else {
    const primerError = formulario.querySelector(".invalido");
    if (primerError) primerError.focus();
  }
});
