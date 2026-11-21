// Reproductor: un solo medio sonando a la vez, sin autoplay, y avance al siguiente
document.addEventListener('DOMContentLoaded', () => {
  // Todos los videos y audios de la página, en el orden en que aparecen
  const medios = Array.from(document.querySelectorAll('video, audio'));

  medios.forEach((medio) => {
    // Nada se reproduce solo al entrar a la página
    medio.autoplay = false;
    medio.preload = 'none';

    // Al presionar play en uno, se pausan todos los demás
    medio.addEventListener('play', () => {
      medios.forEach((otro) => {
        if (otro !== medio) otro.pause();
      });
      marcarActivo(medio);
    });

    // Al terminar, pasa al siguiente
    medio.addEventListener('ended', () => {
      const siguiente = medios[medios.indexOf(medio) + 1];
      if (!siguiente) return;

      if (siguiente.tagName === 'AUDIO') {
        // El audio siguiente suena solo
        siguiente.play().catch(() => {});
      } else {
        // Los videos NO se reproducen solos: se muestra y hay que presionar play
        marcarActivo(siguiente);
        siguiente.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  function marcarActivo(medio) {
    document.querySelectorAll('.tarjeta.activa').forEach((t) => t.classList.remove('activa'));
    const tarjeta = medio.closest('.tarjeta');
    if (tarjeta) tarjeta.classList.add('activa');
  }
});
