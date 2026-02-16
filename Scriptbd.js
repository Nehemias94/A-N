//mensaje con tiempo para quitarce
/*function showSuccessMessage(texto) {
  contenedorMensaje.style.display = 'block';
  contenedorMensaje.style.color = 'var(--cafe-dark)';
  contenedorMensaje.textContent = texto;

  setTimeout(() => {
    contenedorMensaje.style.display = 'none';
  }, 4000);
}*/

async function confirmarAsistencia() {
  
  //const seguro = confirm("¿Estás seguro de que deseas confirmar tu asistencia?");
  //if (!seguro) return;

  const seguro = await mostrarModal("¿Estás seguro de que deseas confirmar tu asistencia?");
  if (!seguro) return;
  
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
        btn.textContent = originalText;
        showMessage('Ingresa cuántos asistirán.', { type: 'error' });
        return;
      }
      if (cantidadConfirmada > invitado.numero_invitados) {
        btn.disabled = false;
        const originalText = btn.textContent;
        btn.textContent = originalText;
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
      btn.textContent = originalText;
      showMessage('No se pudo guardar la confirmación.', { type: 'error' });
      return;
    }

    btn.textContent = "Confirmado ✔";
    btn.style.background = "#888";
    btn.disabled = true;

        // Bloqueo UI
    btnNo.disabled = true;
    const originalText = btnNo.textContent;
    btnNo.style.display = "none";

    // Ocultar input si aplica
    if (invitado.numero_invitados === 1 || cantidadConfirmada >= 1) {
      contenedor.style.display = "none";
    }

    //showMessage(`Hola ${invitado.nombre}, gracias por confirmar 🤎  Has confirmado ${cantidadConfirmada} invitado(s). Tu numero de mesa: ${invitado.numero_mesa} ¡Te Esperamos!`);
    showSuccessMessage(`Hola ${invitado.nombre}, gracias por confirmar 🤎  Has confirmado ${cantidadConfirmada} invitado(s). Tu numero de mesa: ${invitado.numero_mesa} ¡Te Esperamos!`);

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

async function confirmarNoAsistencia() {
  // Bloqueo UI
  btnNo.disabled = true;
  const originalText = btnNo.textContent;
  btnNo.textContent = 'Guardando No ...';
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

    // Actualizar
    const updatedData = {
      confirmado: false,
      fecha_confirmacion: new Date().toISOString().split("T")[0],
      hora_confirmacion: new Date().toLocaleTimeString("es-ES", { hour12: false }),
    };

    const { error } = await db
      .from("invitados")
      .update(updatedData)
      .eq("codigo", invitadoID);

    if (error) {
      console.error(error);
      btn.disabled = false;
      const originalText = btn.textContent;
      btn.textContent = originalText;
      showMessage('No se pudo guardar la confirmación.', { type: 'error' });
      return;
    }

    btnNo.textContent = "Has Confirmado No asistiras ✔";
    btnNo.style.background = "#888";
    btnNo.disabled = true;

        // Bloqueo UI
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.style.display = "none";

    // Ocultar input si aplica
      contenedor.style.display = "none";

    showMessage(`Hola ${invitado.nombre}, Has Confirmado No asistira, gracias por confirmar 🤎`);

  } catch (err) {
    console.error(err);
    showMessage('Ocurrió un error inesperado. Intenta nuevamente o más tarde.', { type: 'error' });
  } finally {
    // restaurar estado si quedó habilitado por error
    if (!btnNo.disabled) {
      btnNo.textContent = originalText;
      btnNo.disabled = false;
    }
  } 
}
