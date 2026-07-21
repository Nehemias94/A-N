/*
  Manejo avanzado de errores:
  - Muestra error.message, code y details
  - Detecta falta de internet
  - Muestra status HTTP
  - Log completo en consola
*/
// descomentar linea 151 hasta 164 para volver avilar la validacion del ID
let invitadoID = null;
const SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content || '';
const SUPABASE_ANON_KEY = document.querySelector('meta[name="supabase-anon-key"]')?.content || '';
//const FECHA_LIMITE_CONFIRMACION = new Date("2026-03-15T23:59:59");
const FECHA_LIMITE_CONFIRMACION = new Date("2026-12-31T23:59:59-06:00");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL/KEY no configurados.');
}

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*const params = new URLSearchParams(window.location.search);
const invitadoID = params.get("id");

if (!invitadoID) {
  await mostrarModalMensajeError("❌ Enlace inválido. ID vacio");
  throw new Error("ID vacío");
}*/

//const regexCodigo = /^INV\d{4}$/;
//const regexCodigo = /^INV\d{4}(-[a-zA-Z0-9-]+)?$/;
//const regexCodigo = /^INV\d{4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/*if (!regexCodigo.test(invitadoID)) {
  showMessage("Enlace inválido.", { type: "error" });
  throw new Error("ID inválido");
}*/

/*if (!regexCodigo.test(invitadoID)) {
  await mostrarModalMensajeError(
    "❌ Este enlace no es válido o está incompleto. Formato ID inválido"
  );
  throw new Error("Formato ID inválido");
}*/


const nombreSpan = document.getElementById('nombreInvitado');
const mensajeRegalo = document.getElementById('mensajeRegalo');
const contenedor = document.getElementById('contenedorInvitados');
const contador = document.getElementById('contadorInvitados');
const input = document.getElementById('inputInvitados');
const btn = document.getElementById('btnConfirmar');
const btnNo = document.getElementById('btnNoConfirmar');
const contenedorMensaje = document.getElementById('mensajeConfirmacion');
const msjeMesa = document.getElementById('msjeMesa');
const numMesa = document.getElementById('numMesa');

function fechaLimiteAlcanzada() {
  const ahora = new Date();
  return ahora > FECHA_LIMITE_CONFIRMACION;
}

/* =========================
   FUNCIONES DE MENSAJES
========================= */

function showMessage(text, opts = {}) {
  contenedorMensaje.style.display = 'block';

  if (opts.type === 'error') {
    contenedorMensaje.style.color = 'var(--error)';
    contenedorMensaje.setAttribute('aria-live', 'assertive');
  } else {
    contenedorMensaje.style.color = opts.color || 'var(--cafe-dark)';
    contenedorMensaje.setAttribute('aria-live', 'polite');
  }

  contenedorMensaje.textContent = text;
}

async function mostrarErrorSupabase(error, status = null) {
  console.error("===== ERROR SUPABASE =====");
  console.error("Status:", status);
  console.error("Error completo:", error);

  let mensaje = "Ocurrió un error.";

  if (!navigator.onLine) {
    mensaje = "No tienes conexión a internet.";
  } else if (error) {
    mensaje = `
    Error: ${error.message || 'Error desconocido'}
    ${error.code ? `Código: ${error.code}` : ''}
    ${error.details ? `Detalle: ${error.details}` : ''}
    ${status ? `HTTP: ${status}` : ''}
    `;
  }

  showMessage(mensaje, { type: 'error' });
  await mostrarModalMensaje(
       '❌' + mensaje
  );
}

/* =========================
   CARGA INICIAL
========================= */

document.addEventListener("DOMContentLoaded", async () => {
  btn.addEventListener('click', confirmarAsistencia);
btnNo.addEventListener('click', confirmarNoAsistencia);

// ⛔ Validar fecha límite
/*if (fechaLimiteAlcanzada()) {

  btn.disabled = true;
  btnNo.disabled = true;

  btn.style.background = "#888";
  btnNo.style.background = "#888";

  contenedor.style.display = "none";

  showMessage("⏰ La fecha límite para confirmar asistencia ya finalizó.");

  await mostrarModalMensaje(
    "⏰ La fecha límite para confirmar asistencia ya finalizó. Si necesitas ayuda comunícate con los novios."
  );

  return;
}*/

  if (fechaLimiteAlcanzada()) {

    btn.disabled = true;
    btnNo.disabled = true;
  
    btn.style.background = "#888";
    btnNo.style.background = "#888";
  
    contenedor.style.display = "none";
  
    //DESCOMENTAR ESTA PARTE
    //showMessage("⏰ La fecha límite para confirmar asistencia ya finalizó.");
  
    //DESCOMENTAR ESTA PARTE
    //await mostrarModalMensaje(
    //  "⏰ La fecha límite para confirmar asistencia ya finalizó."
    //);
  
    // ⚠ NO usar return aquí
  }

  // 🔎 Obtener ID desde HASH (#) o ?id=
/*function obtenerID() {
  // 1️⃣ Primero intentar con #
  const hashID = window.location.hash.substring(1);

  if (hashID) {
    return hashID;
  }
  

  // 2️⃣ Si no hay hash, intentar con ?id=
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}*/

// 🔎 Obtener ID (Quemado para pruebas)
function obtenerID() {
  // Reemplaza este texto por el ID real que quieras probar en tu base de datos
  return "INV1234-abcdef01-abcd-abcd-abcd-abcdef012345"; 
}

invitadoID = obtenerID();
  
  //const params = new URLSearchParams(window.location.search);  
  //invitadoID = params.get("id");

  //DESCOMENTAR ESTA PARTE  
  /*if (!invitadoID) {
      await mostrarModalMensajeError("❌ Enlace inválido. Este enlace no es válido o ya no está disponible. Por favor, solicita una nueva invitación.");
      return;
    }*/

  const regexCodigo = /^INV\d{4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  //DESCOMENTAR ESTA PARTE
  /*if (!regexCodigo.test(invitadoID)) {
    await mostrarModalMensajeError(
      "❌ Este enlace no es válido o está incompleto."
    );
     return; // 🔥 IMPORTANTE: no usar throw aquí
  }*/
   
     if (!navigator.onLine) {
      //showMessage('No tienes conexión a internet.', { type: 'error' });
        await mostrarModalMensajeError(
           '❌ No tienes conexión a internet. Recargue la pagina o intente mas tarde.'
        );
      return;
    }

  try {

   /* if (!navigator.onLine) {
      //showMessage('No tienes conexión a internet.', { type: 'error' });
        await mostrarModalMensaje(
           '❌ No tienes conexión a internet.'
        );
      return;
    }*/

    const { data, error, status } = await db
      .from("invitados")
      .select("*")
      .eq("codigo", invitadoID)
      .single();

    /*if (error) {
      mostrarErrorSupabase(error, status);
      return;
    }*/

    //DESCOMENTAR ESTA PARTE
    /*if (error) {
      await mostrarModalMensajeError(
        "❌ Este enlace no es válido o ya no está disponible."
      );
      return;
    }*/

    //DESCOMENTAR ESTA PARTE
    /*if (!data) {
      //showMessage('Invitado no encontrado.', { type: 'error' });
        await mostrarModalMensajeError(
             '❌ Este enlace no es válido o ya no está disponible. Por favor, solicita una nueva invitación.'
        );
      return;
    }*/

    //nombreSpan.textContent = data.nombre || 'invitado;
    //nombreSpan.textContent = data.nombre; //DESCOMENTAR ESTA PARTE
    nombreSpan.textContent = 'Nehemias Zepeda';

    if (data.regalo === true) {
      mensajeRegalo.style.display = 'block';
    }

    // 🪑 Mostrar mesa SOLO si ya confirmó
    //if (data.confirmado === true && data.numero_mesa) {//DESCOMENTAR
      numMesa.textContent = `🪑 Tu mesa asignada es la número ${data.numero_mesa}`;
      msjeMesa.style.display = 'block';
      msjeMesa.removeAttribute('aria-hidden');
    //} else { //DESCOMENTAR
    //  msjeMesa.style.display = 'none';
    //}


    if (data.numero_invitados === 1 || data.confirmado === true) {
      contenedor.style.display = 'none';
    }

    if (data.numero_invitados > 1 || data.confirmado === true) {
      contador.textContent = `Máximo invitados permitidos: ${data.numero_invitados}.`;
      input.setAttribute('max', String(data.numero_invitados));
    }

    if (data.confirmado === true) {
      btn.textContent = "Ya confirmado ✔";
      btn.style.background = "#888";
      btn.disabled = true;

      const confirmados = data.numero_invitados_confirmados || 1;
      const numeromesa = data.numero_mesa || 1;

      showMessage(
        `Hola ${data.nombre}, gracias por confirmar 🤎 Has confirmado ${confirmados} invitado(s). tu mesa asignada es la número ${numeromesa} ¡Te Esperamos!`
      );

       btnNo.disabled = true;
       btnNo.style.display = "none";

        /*await mostrarModalMensaje(
             `Hola ${data.nombre}, gracias por confirmar 🤎 Has confirmado ${confirmados} invitado(s). tu mesa asignada es la número ${numeromesa} ¡Te Esperamos!`
        );*/
    }
    
    if (data.confirmado === false) {
        btnNo.textContent = "Has confirmado que no asistirás. ✔";
        btnNo.style.background = "#888";
        btnNo.disabled = true;
    
        contenedor.style.display = "none";
    
        showMessage(
          `Hola ${data.nombre}, gracias por confirmar 🤎 Has confirmado que no asistirás.`);
    
         btn.disabled = true;
         btn.style.display = "none";
      
    }

  } catch (err) {
    console.error("ERROR GENERAL:", err);
    /*showMessage(
      `Error inesperado: ${err.message || 'No se pudo conectar al servidor.'}`,
      { type: 'error' }
    );*/

    //DESCOMENTAR ESTA PARTE
    /*await mostrarModalMensaje(
        `❌ Error inesperado: ${err.message || 'No se pudo conectar al servidor.'}`,
      { type: 'error' }
    );*/
  }
});

/* =========================
   MODAL LOGICA
========================= */

const modal = document.getElementById('modalConfirmacion');
const modalTexto = document.getElementById('modalTexto');
const modalAceptar = document.getElementById('modalAceptar');
const modalCancelar = document.getElementById('modalCancelar');
const spinner = document.getElementById('spinner');
const btnTexto = document.getElementById('btnTexto');

const modalmsj = document.getElementById('modalMessage');
const modalTextomsj = document.getElementById('modalTexto');
const modalCancelarmsj = document.getElementById('modalCancelar');

function mostrarModal(mensaje) {
  return new Promise((resolve) => {

    modalTexto.textContent = mensaje;
    modal.style.display = 'flex';

    function cerrar(valor) {
      modal.style.display = 'none';
      modalAceptar.classList.remove('loading');
      spinner.style.display = 'none';
      btnTexto.textContent = 'Confirmar';
      modalAceptar.disabled = false;

      modalAceptar.removeEventListener('click', aceptar);
      modalCancelar.removeEventListener('click', cancelar);

      resolve(valor);
    }

    async function aceptar() {

      // 🔄 Activar spinner
      modalAceptar.classList.add('loading');
      spinner.style.display = 'inline-block';
      btnTexto.textContent = 'Guardando...';
      modalAceptar.disabled = true;

      try {
        // Aquí va tu proceso real (ejemplo async)
        await new Promise(resolve => setTimeout(resolve, 2000));

        cerrar(true);

      } catch (error) {
        console.error(error);
        cerrar(false);
      }
    }

    function cancelar() {
      cerrar(false);
    }

    modalAceptar.addEventListener('click', aceptar);
    modalCancelar.addEventListener('click', cancelar);

    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escListener);
        cerrar(false);
      }
    });

  });
}

/*Modal message*/

const modalMensaje = document.getElementById('modalMessage');
const modalTextoMensaje = document.getElementById('modalTextoMensaje');
const modalCerrarMensaje = document.getElementById('modalCerrarMensaje');

function mostrarModalMensaje(mensaje) {
  return new Promise((resolve) => {

    modalTextoMensaje.textContent = mensaje;
    modalMensaje.style.display = 'flex';

    function cerrar() {
      modalMensaje.style.display = 'none';
      modalCerrarMensaje.removeEventListener('click', cerrar);
      resolve(true);
    }

    modalCerrarMensaje.addEventListener('click', cerrar);

    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escListener);
        cerrar();
      }
    });

  });
}

/*Modal message*/

const modalMensajeError = document.getElementById('modalMessageError');
const modalTextoMensajeError = document.getElementById('modalTextoMensajeError');

function mostrarModalMensajeError(mensaje) {
  return new Promise((resolve) => {

    modalTextoMensajeError.textContent = mensaje;
    modalMensajeError.style.display = 'flex';

    resolve(true); // importante cerrar el promise
  });
}
/* =========================
   CONFIRMAR ASISTENCIA
========================= */

//btn.addEventListener('click', confirmarAsistencia);
//btnNo.addEventListener('click', confirmarNoAsistencia);

async function confirmarAsistencia() {
//DESCOMENTAR ESTA PARTE
  //if (fechaLimiteAlcanzada()) {
  //  await mostrarModalMensaje(
  //    "⏰ Lo sentimos, la fecha límite para confirmar asistencia ya finalizó."
  //  );
  //  return;
  //}

  const seguro = await mostrarModal(
    "¿Deseas confirmar tu asistencia?"
  );

  if (!seguro) return;

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Guardando...';

  try {

    if (!navigator.onLine) {
      //showMessage('No tienes conexión a internet.', { type: 'error' });
      await mostrarModalMensaje(
          'No tienes conexión a internet.', { type: 'error' }
      );
      
        btn.textContent = originalText;
        btn.disabled = false;
      return;
    }

    // 🔎 Obtener datos actuales
    const { data: invitado, error: fetchErr, status: fetchStatus } = await db
      .from("invitados")
      .select("confirmado, nombre, numero_invitados, numero_invitados_confirmados, numero_mesa")
      .eq("codigo", invitadoID)
      .single();

    if (fetchErr) {
      mostrarErrorSupabase(fetchErr, fetchStatus);
      return;
    }

    if (!invitado) {
      //showMessage('Invitado no encontrado.', { type: 'error' });

      await mostrarModalMensaje(
          '❌ Invitado no encontrado.', { type: 'error' });
          btn.textContent = originalText;
          btn.disabled = false;
      return;
    }

    if (invitado.confirmado) {
      //showMessage('Ya habías confirmado antes 🤎');
      await mostrarModalMensaje('Ya habías confirmado antes 🤎');

    btn.textContent = "Confirmado ✔";
    btn.style.background = "#888";
    btn.disabled = true;

    contenedor.style.display = "none";

     btnNo.disabled = true;
     btnNo.style.display = "none";
      
    showMessage(
      `Hola ${invitado.nombre}, 
      gracias por confirmar 🤎 Has confirmado ${invitado.numero_invitados_confirmados} invitado(s). tu mesa asignada es la número ${invitado.numero_mesa} 
      ¡Te Esperamos!`
    );
      
      return;
    }

    // 🎟 Validar cantidad
    let cantidadConfirmada = 1;

    if (invitado.numero_invitados > 1) {
      cantidadConfirmada = parseInt(input.value, 10);

      if (!cantidadConfirmada || cantidadConfirmada < 1) {
        //showMessage('Ingresa cuántos asistirán.', { type: 'error' });
        await mostrarModalMensaje('❌ Debe ingresa cuántos asistirán.', { type: 'error' });
        btn.textContent = originalText;
        btn.disabled = false;
        return;
      }

      if (cantidadConfirmada > invitado.numero_invitados) {
        /*showMessage(
          `Solo puedes confirmar hasta ${invitado.numero_invitados} invitado(s).`,
          { type: 'error' }
        );*/
        btn.textContent = originalText;
        btn.disabled = false;
        await mostrarModalMensaje(`❌ Solo puedes confirmar ${invitado.numero_invitados} invitado(s).` , { type: 'error' });
        return;
      }
    }

    const updatedData = {
      confirmado: true,
      fecha_confirmacion: new Date().toISOString().split("T")[0],
      hora_confirmacion: new Date().toLocaleTimeString("es-ES", { hour12: false }),
      numero_invitados_confirmados: cantidadConfirmada
    };

       // 🔐 UPDATE protegido (solo si no estaba confirmado) 
    const { error: updateErr, status: updateStatus } = await db
      .from("invitados")
      .update(updatedData)
      .eq("codigo", invitadoID)
      .or("confirmado.is.null,confirmado.eq.false") // ✅ clave
        .select(); // necesario para saber si actualizó

    if (updateErr) {
      mostrarErrorSupabase(updateErr, updateStatus);
      btn.textContent = originalText;
      btn.disabled = false;
      return;
    }

    btn.textContent = "Confirmado ✔";
    btn.style.background = "#888";
    btn.disabled = true;

    contenedor.style.display = "none";

        // 🎀 Mostrar número de mesa
    if (invitado.numero_mesa) {
      numMesa.textContent = `🪑 Tu mesa asignada es la número ${invitado.numero_mesa}`;
      msjeMesa.style.display = 'block';
      msjeMesa.removeAttribute('aria-hidden');
    }


    btnNo.textContent = originalText;
    btnNo.disabled = true;
    btnNo.style.display = "none";

    showMessage(
      `Hola ${invitado.nombre}, gracias por confirmar 🤎 Has confirmado ${cantidadConfirmada} invitado(s). ¡Te Esperamos!`
    );

  
    await mostrarModalMensaje(
        `🎉Gracias por confirmar tu asistencia 🤎.
        Has confirmado ${cantidadConfirmada} invitado(s),
        tu mesa asignada es la número ${invitado.numero_mesa} ¡Te Esperamos!.`
    );
  } catch (err) {
    //console.error("ERROR INESPERADO:", err); //DESCOMENTAR ESTA PARTE
   /* showMessage(
      `Error inesperado: ${err.message || 'Error de conexión.'}`,
      { type: 'error' }
    );*/

    //DESCOMENTAR ESTA PARTE
    /*await mostrarModalMensaje(
      `❌ Error inesperado: ${err.message || 'Error de conexión.'}`,
      { type: 'error' }
    );*/
    btn.textContent = originalText;
    btn.disabled = false;
  } finally {
    if (!btn.disabled) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}

/* Enviar con Enter */
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btn.click();
  }
});

/*********************No***********************/

async function confirmarNoAsistencia() {

  if (fechaLimiteAlcanzada()) {
    await mostrarModalMensaje(
      "⏰ La fecha límite para confirmar asistencia ya finalizó."
    );
    return;
  }

  const seguro = await mostrarModal(
    "¿Deseas confirmar que NO asistirás?"
  );

  if (!seguro) return;

  btnNo.disabled = true;
  const originalText = btnNo.textContent;
  btnNo.textContent = 'Guardando...';

  try {

    if (!navigator.onLine) {
      //showMessage('No tienes conexión a internet.', { type: 'error' });
      await mostrarModalMensaje(
        '❌ No tienes conexión a internet.', { type: 'error' }
      );
      return;
    }

    // 🔎 Obtener datos actuales
    const { data: invitado, error: fetchErr, status: fetchStatus } = await db
      .from("invitados")
      .select("confirmado, nombre, numero_invitados, numero_invitados_confirmados, numero_mesa")
      .eq("codigo", invitadoID)
      .single();

    if (fetchErr) {
      mostrarErrorSupabase(fetchErr, fetchStatus);
      return;
    }

    if (!invitado) {
      showMessage('Invitado no encontrado.', { type: 'error' });
      return;
    }

    if (invitado.confirmado === false) {
      showMessage('Has confirmado que no asistirás 🤎');
      return;
    }

    const updatedData = {
      confirmado: false,
      fecha_confirmacion: new Date().toISOString().split("T")[0],
      hora_confirmacion: new Date().toLocaleTimeString("es-ES", { hour12: false })
    };

       // 🔐 UPDATE protegido (solo si no estaba confirmado) 
    const { error: updateErr, status: updateStatus } = await db
      .from("invitados")
      .update(updatedData)
      .eq("codigo", invitadoID)
      //.is("confirmado", null)
      .or("confirmado.is.null,confirmado.eq.false")  
      .select(); // necesario para saber si actualizó

    if (updateErr) {
      mostrarErrorSupabase(updateErr, updateStatus);
      btnNo.textContent = originalText;
      btnNo.disabled = false;
      return;
    }

    btnNo.textContent = "Has confirmado que no asistirás. ✔";
    btnNo.style.background = "#888";
    btnNo.disabled = true;

    contenedor.style.display = "none";

    showMessage(
      `Hola ${invitado.nombre}, gracias por confirmar 🤎 Has confirmado que no asistirás.`);

  
    await mostrarModalMensaje(
        `Hola ${invitado.nombre}, gracias por confirmar 🤎 Has confirmado que no asistirás.`
    );

    btn.textContent = originalText;
    btn.disabled = true;
    btn.style.display = "none";

  //DESCOMENTAR ESTA PARTE
    /*} catch (err) {
    console.error("ERROR INESPERADO:", err);
    showMessage(
      `Error inesperado: ${err.message || 'Error de conexión.'}`,
      { type: 'error' }
    );
    btnNo.textContent = originalText;
    btnNo.disabled = false;
  } finally {
    if (!btnNo.disabled) {
      const originalText = btnNo.textContent;
      btnNo.textContent = originalText;
      btnNo.disabled = false;
    }
  }*/
}



























































