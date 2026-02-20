// 🚫 Deshabilitar clic derecho
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// 🚫 Bloquear teclas de inspección
document.addEventListener("keydown", function (e) {
  // F12
  if (e.key === "F12") {
    e.preventDefault();
  }

  // Ctrl + Shift + I
  if (e.ctrlKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
  }

  // Ctrl + Shift + J
  if (e.ctrlKey && e.shiftKey && e.key === "J") {
    e.preventDefault();
  }

  // Ctrl + U (ver código fuente)
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
  }
});

// ⚠️ Detectar si DevTools está abierto
/*setInterval(function () {
  const anchoDiferencia = window.outerWidth - window.innerWidth;
  const altoDiferencia = window.outerHeight - window.innerHeight;

  if (anchoDiferencia > 160 || altoDiferencia > 160) {
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <h2>Inspección detectada 🚫</h2>
      </div>
    `;
  }*/

}, 1000);
