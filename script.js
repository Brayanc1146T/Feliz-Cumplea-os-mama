/* ============================================================
   HISTORIA PARA MAMÁ — SCRIPT PRINCIPAL
   ============================================================ */

(function () {
    "use strict";

    /* ------------------------------------------------------------
       UTILIDADES
    ------------------------------------------------------------ */
    const $ = (id) => document.getElementById(id);

    /** Muestra una sección y oculta las demás */
    const mostrarSeccion = (seccionAMostrar, seccionesAOcultar) => {
        if (!seccionAMostrar) return;

        seccionesAOcultar.forEach((seccion) => {
            if (seccion) {
                seccion.classList.add("oculto");
                seccion.setAttribute("aria-hidden", "true");
            }
        });

        seccionAMostrar.classList.remove("oculto");
        seccionAMostrar.setAttribute("aria-hidden", "false");

        // Scroll suave al inicio de la nueva sección
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ------------------------------------------------------------
       ELEMENTOS DE LA HISTORIA
    ------------------------------------------------------------ */
    const boton       = $("comenzar");
    const portada     = $("portada");

    const capitulo1   = $("capitulo1");
    const capitulo2   = $("capitulo2");
    const capitulo3   = $("capitulo3");
    const capitulo4   = $("capitulo4");
    const capitulo5   = $("capitulo5");
    const sorpresa    = $("sorpresa");

    const siguiente1  = $("siguiente1");
    const siguiente2  = $("siguiente2");
    const siguiente3  = $("siguiente3");
    const siguiente4  = $("siguiente4");
    const siguiente5  = $("siguiente5");
    const reiniciar   = $("reiniciar");

    /* ------------------------------------------------------------
       ELEMENTOS DEL REPRODUCTOR
    ------------------------------------------------------------ */
    const audio         = $("audio");
    const botonMusica   = $("reproducir");
    const disco         = document.querySelector(".disco");
    const nombreCancion = $("nombreCancion");

    /* Textos del reproductor */
    const TEXTO_UI = {
        play:     "▶",
        pause:    "❚❚",
        sonando:  "Sonando para ti, mamá 🖤",
        pausada:  "Música pausada",
        inicial:  "Nuestra música",
    };

    /* ============================================================
       NAVEGACIÓN ENTRE SECCIONES
    ============================================================ */

    // Portada → Capítulo 1
    if (boton) {
        boton.addEventListener("click", () => {
            mostrarSeccion(capitulo1, [portada]);
        });
    }

    // Capítulo 1 → Capítulo 2
    if (siguiente1) {
        siguiente1.addEventListener("click", () => {
            mostrarSeccion(capitulo2, [capitulo1]);
        });
    }

    // Capítulo 2 → Capítulo 3
    if (siguiente2) {
        siguiente2.addEventListener("click", () => {
            mostrarSeccion(capitulo3, [capitulo2]);
        });
    }

    // Capítulo 3 → Capítulo 4
    if (siguiente3) {
        siguiente3.addEventListener("click", () => {
            mostrarSeccion(capitulo4, [capitulo3]);
        });
    }

    // Capítulo 4 → Carta final (Capítulo 5)
    if (siguiente4) {
        siguiente4.addEventListener("click", () => {
            mostrarSeccion(capitulo5, [capitulo4]);
        });
    }

    // Capítulo 5 → Sorpresa final
    if (siguiente5) {
        siguiente5.addEventListener("click", () => {
            mostrarSeccion(sorpresa, [capitulo5]);
        });
    }

    // Sorpresa → Volver al inicio
    if (reiniciar) {
        reiniciar.addEventListener("click", () => {
            // Detener música y resetear reproductor
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
            actualizarBotonMusica(false);
            if (nombreCancion) nombreCancion.textContent = TEXTO_UI.inicial;

            // Volver a la portada
            mostrarSeccion(portada, [sorpresa]);
        });
    }

    /* ============================================================
       REPRODUCTOR DE MÚSICA
    ============================================================ */

    /** Actualiza el estado visual del botón de música */
    function actualizarBotonMusica(sonando) {
        if (botonMusica) {
            botonMusica.textContent = sonando ? TEXTO_UI.pause : TEXTO_UI.play;
            botonMusica.setAttribute(
                "aria-label",
                sonando ? "Pausar música" : "Reproducir música"
            );
        }
        if (disco) {
            disco.classList.toggle("sonando", sonando);
        }
    }

    /** Alterna play / pause */
    function alternarMusica() {
        if (!audio) return;

        if (audio.paused) {
            // Si el navegador bloquea la reproducción (por falta de interacción),
            // el .catch lo maneja sin romper la página.
            const promesa = audio.play();

            if (promesa !== undefined) {
                promesa
                    .then(() => {
                        actualizarBotonMusica(true);
                        if (nombreCancion) {
                            nombreCancion.textContent = TEXTO_UI.sonando;
                        }
                    })
                    .catch((error) => {
                        // Silencioso: puede ocurrir si el navegador bloquea el autoplay
                        console.warn("No se pudo reproducir la música:", error);
                        actualizarBotonMusica(false);
                    });
            } else {
                // Navegadores antiguos sin promesa
                actualizarBotonMusica(true);
                if (nombreCancion) {
                    nombreCancion.textContent = TEXTO_UI.sonando;
                }
            }
        } else {
            audio.pause();
            actualizarBotonMusica(false);
            if (nombreCancion) {
                nombreCancion.textContent = TEXTO_UI.pausada;
            }
        }
    }

    // Click en el botón de música
    if (botonMusica) {
        botonMusica.addEventListener("click", alternarMusica);
    }

    // Sincroniza el estado si el audio termina (por seguridad, aunque tenga loop)
    if (audio) {
        audio.addEventListener("ended", () => {
            actualizarBotonMusica(false);
            if (nombreCancion) nombreCancion.textContent = TEXTO_UI.pausada;
        });

        // Recupera el tiempo guardado (opcional, por si recarga)
        try {
            const tiempoGuardado = parseFloat(
                sessionStorage.getItem("audioTime") || "0"
            );
            if (!isNaN(tiempoGuardado) && tiempoGuardado > 0) {
                audio.currentTime = tiempoGuardado;
            }
        } catch (e) {
            /* Ignorar errores de sessionStorage */
        }

        // Guarda el tiempo periódicamente
        audio.addEventListener("timeupdate", () => {
            try {
                sessionStorage.setItem("audioTime", String(audio.currentTime));
            } catch (e) {
                /* Ignorar */
            }
        });
    }

    /* ============================================================
       ATAJO DE TECLADO: barra espaciadora = play/pause
       (solo si el foco NO está en un botón/input)
    ============================================================ */
    document.addEventListener("keydown", (event) => {
        const foco = document.activeElement;
        const esBoton =
            foco && (foco.tagName === "BUTTON" || foco.tagName === "INPUT");

        if (event.code === "Space" && !esBoton) {
            event.preventDefault();
            alternarMusica();
        }
    });

    /* ============================================================
       INICIALIZACIÓN
       (por si el HTML empieza con el botón mal escrito)
    ============================================================ */
    actualizarBotonMusica(false);

    // Asegura que el estado inicial de las secciones sea coherente
    document.querySelectorAll(".oculto").forEach((el) => {
        el.setAttribute("aria-hidden", "true");
    });
    if (portada) portada.setAttribute("aria-hidden", "false");

})();