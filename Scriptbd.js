/*
  Mejoras principales en JS:
  - No usar innerHTML para insertar el nombre (XSS). Usar textContent.
  - Validaciones en cliente (max, min).
  - Deshabilitar botón durante petición y evitar envíos múltiples.
  - Manejo de errores y mensajes de loading.
  - Separación clara de lógica y mensajes mostrados.
  - Nota de seguridad: nunca subir service_role key al cliente. USE RLS y políticas en Supabase.
*/

/* Lee la configuración desde meta tags — así no queda hardcodeado en el script visible en el HTML si prefieres inyectarlo desde el servidor. */
const SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content || '';
const SUPABASE_ANON_KEY = document.querySelector('meta[name="supabase-anon-key"]')?.content || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL/KEY no configurados. Reemplaza meta tags con valores seguros para producción.');
}

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Utilidades */
const params = new URLSearchParams(window.location.search);
const invitadoID = params.get("id");

/* Referencias DOM */
const nombreSpan = document.getElementById('nombreInvitado');
const mensajeRegalo = document.getElementById('mensajeRegalo');
const contenedor = document.getElementById('contenedorInvitados');
const contador = document.getElementById('contadorInvitados');
const input = document.getElementById('inputInvitados');
const btn = document.getElementById('btnConfirmar');
const contenedorMensaje = document.getElementById('mensajeConfirmacion');
const mensajeMesa = document.getElementById('msjeMesa');
const numeroMesa = document.getElementById('numMesa');

/* Mensajes: ahora aceptamos { type: 'error' } para mostrar en rojo y usar aria-live="assertive" */
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

function showHTMLMessage(html, opts = {}) {
  contenedorMensaje.style.display = 'block';
  if (opts.type === 'error') {
    contenedorMensaje.style.color = 'var(--error)';
    contenedorMensaje.setAttribute('aria-live', 'assertive');
  } else {
    contenedorMensaje.style.color = opts.color || 'var(--cafe-dark)';
    contenedorMensaje.setAttribute('aria-live', 'polite');
  }
  contenedorMensaje.innerHTML = html;
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!invitadoID) {
    // Si no hay id, dejamos la página genérica.
    return;
  }

  try {
    // mejor usar try/catch por si falla la conexión
    const { data, error } = await db
      .from("invitados")
      .select("*")
      .eq("codigo", invitadoID)
      .single();

    if (error) {
      console.error(error);
      showMessage('No se pudo obtener la información del invitado.', { type: 'error' });
      return;
    }
    if (!data) {
      showMessage('Invitado no encontrado.', { type: 'error' });
      return;
    }

    // Usar textContent en vez de innerHTML para evitar inyección
    nombreSpan.textContent = data.nombre || 'invitado';

    // Mostrar regalo si corresponde
    if (data.regalo === true) {
      mensajeRegalo.style.display = 'block';
      mensajeRegalo.setAttribute('aria-hidden', 'false');
    } else {
      mensajeRegalo.style.display = 'none';
    }

   	// Mostrar Numero de mesa si corresponde
    //if (data.numero_mesa > 0 && data.confirmado === true) {
    //  numeroMesa.textContent = `Numero de mesa: ${data.numero_mesa}.`;
     // mensajeMesa.style.display = 'block';
     // mensajeMesa.setAttribute('aria-hidden', 'false');
    //} else {
      //mensajeMesa.style.display = 'none';
      //numeroMesa.style.display = 'none';
    //}
    
    // Si no puede traer invitados, ocultamos el input
    if (data.numero_invitados === 1 || data.confirmado === true) {
      contenedor.style.display = 'none';
    }

    // Mostrar contador si tiene invitados
    if (data.numero_invitados > 1) {
      contador.textContent = `Máximo invitados permitidos: ${data.numero_invitados}.`;
      // Establecemos el max en el input para ayudar a la validación
      input.setAttribute('max', String(data.numero_invitados));
      input.value = data.numero_invitados === 1 ? '1' : '';
      input.placeholder = `Máx ${data.numero_invitados}`;
    }

    if (data.confirmado === true) {
      btn.textContent = "Ya confirmado ✔";
      btn.style.background = "#888";
      btn.disabled = true;

      const confirmados = data.numero_invitados_confirmados || 1;
      //showMessage(`Hola ${data.nombre}, gracias por confirmar. Has confirmado ${confirmados} invitado(s).`);
      showMessage(`Hola ${data.nombre}, gracias por confirmar 🤎  Has confirmado ${confirmados} invitado(s). Tu numero de mesa: ${data.numero_mesa} ¡Te Esperamos!`);
    }

  } catch (err) {
    console.error(err);
    showMessage('Error al conectar con la base de datos.', { type: 'error' });
  }
});

/* Confirmar asistencia: validaciones y actualización */
btn.addEventListener('click', confirmarAsistencia);

async function confirmarAsistencia() {
  // Bloqueo UI
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Guardando...';

  try {
    if (!invitadoID) {
      showMessage('No se encontró el ID del invitado.', { type: 'error' });
      return;
    }

    const { data: invitado, error: fetchErr } = await db
      .from("invitados")
      .select("confirmado, nombre, numero_invitados, numero_invitados_confirmados,numero_mesa")
      .eq("codigo", invitadoID)
      .single();

    if (fetchErr) {
      console.error(fetchErr);
      showMessage('Error al verificar el estado de la invitación.', { type: 'error' });
      return;
    }

    if (!invitado || invitado.confirmado) {
      showMessage('Ya habías confirmado antes 🤎');
      return;
    }

    let cantidadConfirmada = 1;
    if (invitado.numero_invitados > 1) {
      cantidadConfirmada = parseInt(input.value, 10);
      if (!cantidadConfirmada || cantidadConfirmada < 1) {
        btn.disabled = false;
        const originalText = btn.textContent;
        btn.textContent = 'Confirmar asistencia';
        showMessage('Ingresa cuántos asistirán.', { type: 'error' });
        return;
      }
      if (cantidadConfirmada > invitado.numero_invitados) {
        btn.disabled = false;
        const originalText = btn.textContent;
        btn.textContent = 'Confirmar asistencia';
        showMessage(`Solo puedes confirmar hasta ${invitado.numero_invitados} invitado(s).`, { type: 'error' });
        btn.disabled = false;
        return;
      }
    }

    // Actualizar
    const updatedData = {
      confirmado: true,
      fecha_confirmacion: new Date().toISOString().split("T")[0],
      hora_confirmacion: new Date().toLocaleTimeString("es-ES", { hour12: false }),
      numero_invitados_confirmados: cantidadConfirmada
    };

    const { error } = await db
      .from("invitados")
      .update(updatedData)
      .eq("codigo", invitadoID);

    if (error) {
      console.error(error);
      btn.disabled = false;
      const originalText = btn.textContent;
      btn.textContent = 'Confirmar asistencia';
      showMessage('No se pudo guardar la confirmación.', { type: 'error' });
      return;
    }

    btn.textContent = "Confirmado ✔";
    btn.style.background = "#888";
    btn.disabled = true;

    // Ocultar input si aplica
    if (invitado.numero_invitados === 1 || cantidadConfirmada >= 1) {
      contenedor.style.display = "none";
    }

    showMessage(`Hola ${invitado.nombre}, gracias por confirmar 🤎  Has confirmado ${cantidadConfirmada} invitado(s). Tu numero de mesa: ${invitado.numero_mesa} ¡Te Esperamos!`);

    // Actualizar contador accesible
    if (invitado.numero_invitados > 1) {
      contador.textContent = `Máximo de invitados permitidos: ${invitado.numero_invitados}. Ya confirmados: ${cantidadConfirmada}`;
    }

  } catch (err) {
    console.error(err);
    showMessage('Ocurrió un error inesperado. Intenta nuevamente o más tarde.', { type: 'error' });
  } finally {
    // restaurar estado si quedó habilitado por error
    if (!btn.disabled) {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
}

/* Mejora UX: permitir enviar con Enter cuando el input está enfocado */
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btn.click();
  }

});




























