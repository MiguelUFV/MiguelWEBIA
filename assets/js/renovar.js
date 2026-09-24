(() => {
  'use strict';

  const TELEFONO_WA = '34685101194';
  // Clave de la API de PageSpeed Insights (proyecto "paginawebcreator" de Google Cloud). Es pública a propósito:
  // solo funciona desde paginawebcreator.com y solo para PageSpeed. Sin clave, la cuota compartida de Google se agota (429).
  const CLAVE_PSI = 'AIzaSyDtzwzb5EOtqSdy9shfD7e1VSLxSvkGNmw';
  const API_PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const LIMITE_ESPERA = 90000;
  const LCP_RAPIDO = 2500;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const enlaceWa = (texto) => `https://wa.me/${TELEFONO_WA}?text=${encodeURIComponent(texto)}`;
  const segundos = (ms) => (ms / 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const esImagen = (dato) => typeof dato === 'string' && dato.startsWith('data:image/');
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, clase, texto) => {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  };

  const NOTAS = [
    ['performance', 'Velocidad en el móvil'],
    ['seo', 'Cómo la ve Google'],
    ['accessibility', 'Fácil de leer y usar'],
    ['best-practices', 'Seguridad y buenas prácticas'],
  ];
  const NIVELES = { bien: 'Bien', mejorable: 'Mejorable', mal: 'Mal' };
  const nivel = (nota) => (nota >= 90 ? 'bien' : nota >= 50 ? 'mejorable' : 'mal');

  // Auditorías de Lighthouse (13 y anteriores) traducidas a lo que le importa al dueño de un negocio, por prioridad.
  const ARREGLOS = [
    [['is-on-https', 'redirects-http'], 'No usa conexión segura', 'Certificado incluido: el candado en la barra del navegador y más confianza.'],
    [['is-crawlable', 'robots-txt', 'http-status-code'], 'Google tiene problemas para entrar', 'La dejo abierta a Google y bien indexada.'],
    [['viewport-insight', 'viewport'], 'No está bien adaptada al móvil', 'La diseño primero para el móvil, que es desde donde te buscan.'],
    [['image-delivery-insight', 'uses-optimized-images', 'modern-image-formats', 'uses-responsive-images', 'offscreen-images'], 'Las fotos pesan más de lo necesario', 'Las comprimo y las sirvo al tamaño justo de cada pantalla, sin perder calidad.'],
    [['render-blocking-insight', 'render-blocking-resources', 'lcp-discovery-insight', 'network-dependency-tree-insight'], 'Hay archivos que frenan la carga', 'Ordeno la carga para que lo importante salga primero.'],
    [['meta-description', 'document-title'], 'A Google le falta la descripción de tu negocio', 'Escribo títulos y descripciones pensados para búsquedas de tu zona.'],
    [['unused-javascript', 'unused-css-rules', 'legacy-javascript-insight', 'duplicated-javascript-insight', 'total-byte-weight', 'mainthread-work-breakdown', 'bootup-time'], 'Carga código que no usa', 'La nueva lleva solo lo necesario: pesa menos y va más fluida.'],
    [['cumulative-layout-shift', 'cls-culprits-insight', 'unsized-images'], 'Las cosas se mueven mientras carga', 'Cada elemento aparece ya en su sitio, sin saltos.'],
    [['document-latency-insight', 'server-response-time'], 'El servidor tarda en responder', 'La alojo en servidores rápidos, cerca de tus clientes.'],
    [['cache-insight', 'uses-long-cache-ttl'], 'Cada visita descarga todo otra vez', 'Configuro la caché para que la segunda visita sea instantánea.'],
    [['meta-viewport'], 'No deja hacer zoom en el móvil', 'Se podrá ampliar con dos dedos, como cualquier web bien hecha.'],
    [['color-contrast'], 'Hay textos que cuestan de leer', 'Colores con contraste suficiente, también a pleno sol.'],
    [['target-size', 'tap-targets'], 'Hay botones difíciles de pulsar con el dedo', 'Botones grandes y bien separados.'],
    [['image-alt', 'button-name', 'link-name', 'label', 'html-has-lang', 'landmark-one-main', 'heading-order'], 'Le falta información para lectores de pantalla', 'Describo fotos y botones: ayuda a Google y a quien no ve bien.'],
    [['link-text', 'crawlable-anchors', 'canonical', 'hreflang'], 'Hay enlaces que confunden a Google', 'Enlaces claros y una sola versión de cada página.'],
    [['font-display-insight', 'font-display'], 'Las letras tardan en aparecer', 'El texto se ve desde el primer momento.'],
    [['errors-in-console', 'inspector-issues', 'deprecations'], 'Tiene errores internos', 'Código limpio y revisado, sin errores.'],
    [['image-aspect-ratio', 'image-size-responsive'], 'Hay fotos deformadas o borrosas', 'Fotos nítidas y con su proporción.'],
  ];
  const MAX_ARREGLOS = 6;
  const falla = (auditoria) => auditoria && typeof auditoria.score === 'number' && auditoria.score < 0.9
    && !['informative', 'notApplicable', 'manual', 'error'].includes(auditoria.scoreDisplayMode);

  const MENSAJES_ESPERA = [
    'Abriendo tu web en un móvil…',
    'Midiendo cuánto tarda en verse…',
    'Revisando lo que lee Google…',
    'Comprobando si se usa bien con el dedo…',
    'Buscando fotos y archivos que pesan de más…',
  ];

  const seccion = $('.rayos');
  const form = $('[data-escaner]');
  if (!seccion || !form) return;
  const campo = form.elements.web;
  const boton = $('[data-escanear]', form);
  const avisoCampo = $('[data-aviso-campo]', form);
  const fotograma = $('[data-fotograma]');
  const reloj = $('[data-reloj]');
  const estadoTexto = $('[data-estado-texto]');
  const diagnostico = $('#diagnostico');
  const planB = $('[data-plan-b]');
  const ctaRenovar = $('[data-cta-renovar]');
  const TEXTO_BOTON = boton.textContent;
  const TEXTO_REPOSO = estadoTexto.textContent;

  const normalizar = (texto) => {
    const limpio = texto.trim().replace(/\s+/g, '');
    if (!limpio) return null;
    try {
      const url = new URL(/^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`);
      if (!url.hostname.includes('.') || url.hostname.endsWith('.local')) return null;
      return url;
    } catch { return null; }
  };
  const nombreVisible = (url) => `${url.hostname.replace(/^www\./, '')}${url.pathname === '/' ? '' : url.pathname}`;

  class ErrorRadiografia extends Error {
    constructor(tipo) { super(tipo); this.tipo = tipo; }
  }

  const pedirInforme = async (url) => {
    const params = new URLSearchParams({ url: url.href, strategy: 'mobile', locale: 'es' });
    NOTAS.forEach(([clave]) => params.append('category', clave));
    if (CLAVE_PSI) params.set('key', CLAVE_PSI);
    const control = new AbortController();
    const corte = setTimeout(() => control.abort(), LIMITE_ESPERA);
    let respuesta;
    try {
      respuesta = await fetch(`${API_PSI}?${params}`, { signal: control.signal });
    } catch {
      throw new ErrorRadiografia('red');
    } finally {
      clearTimeout(corte);
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      const mensaje = datos.error?.message || '';
      if (respuesta.status === 429 || /quota/i.test(mensaje)) throw new ErrorRadiografia('cuota');
      if (/DOCUMENT_REQUEST|DNS|NOT_HTML|NO_FCP|INVALID_URL|unreachable/i.test(mensaje)) throw new ErrorRadiografia('web');
      throw new ErrorRadiografia('google');
    }
    const informe = datos.lighthouseResult;
    if (!informe?.categories) throw new ErrorRadiografia('google');
    if (informe.runtimeError && informe.runtimeError.code !== 'NO_ERROR') throw new ErrorRadiografia('web');
    return informe;
  };

  /* ── Estados del escáner ── */
  let temporizadores = [];
  const limpiarTemporizadores = () => { temporizadores.forEach(clearInterval); temporizadores = []; };

  const empezarEscaneo = () => {
    seccion.dataset.estado = 'escaneando';
    boton.setAttribute('aria-busy', 'true');
    boton.textContent = 'Analizando…';
    fotograma.hidden = true;
    diagnostico.hidden = true;
    planB.hidden = true;
    // En el móvil el escáner queda debajo del formulario: se cierra el teclado y se lleva la vista hasta él.
    campo.blur();
    const movil = $('.movil-rx');
    if (movil.getBoundingClientRect().top > window.innerHeight * 0.5) {
      movil.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'center' });
    }
    const inicio = Date.now();
    let indice = 0;
    estadoTexto.textContent = MENSAJES_ESPERA[0];
    reloj.textContent = '0 s';
    temporizadores.push(setInterval(() => {
      const transcurrido = Math.floor((Date.now() - inicio) / 1000);
      reloj.textContent = `${transcurrido} s`;
    }, 1000));
    temporizadores.push(setInterval(() => {
      indice += 1;
      estadoTexto.textContent = Date.now() - inicio > 40000
        ? 'Algunas webs tardan más en analizarse. Sigo en ello…'
        : MENSAJES_ESPERA[indice % MENSAJES_ESPERA.length];
    }, 3800));
  };

  const terminarEscaneo = () => {
    limpiarTemporizadores();
    boton.removeAttribute('aria-busy');
    boton.textContent = TEXTO_BOTON;
  };

  // El móvil enseña cómo fue apareciendo la web, fotograma a fotograma, hasta la captura final.
  const reproducirCarga = async (informe) => {
    const miniaturas = (informe.audits['screenshot-thumbnails']?.details?.items || []).map((i) => i.data);
    const final = informe.audits['final-screenshot']?.details?.data;
    const secuencia = [...miniaturas, final].filter(esImagen);
    if (!secuencia.length) return;
    seccion.dataset.estado = 'reproduciendo';
    estadoTexto.textContent = 'Así va apareciendo tu web en un móvil.';
    fotograma.hidden = false;
    if (reducir) { fotograma.src = secuencia.at(-1); return; }
    for (const imagen of secuencia) {
      fotograma.src = imagen;
      await esperar(380);
    }
    await esperar(500);
  };

  /* ── Informe ── */
  const pintarNotas = (informe) => {
    const lista = $('[data-notas]');
    lista.replaceChildren(...NOTAS.map(([clave, nombre]) => {
      const nota = Math.round((informe.categories[clave]?.score ?? 0) * 100);
      const nivelNota = nivel(nota);
      const item = el('li', 'nota');
      item.dataset.nivel = nivelNota;
      item.style.setProperty('--valor', '0');
      item.innerHTML = '<svg class="nota__anillo" viewBox="0 0 64 64" aria-hidden="true"><circle class="nota__pista" cx="32" cy="32" r="28"/><circle class="nota__arco" cx="32" cy="32" r="28" pathLength="100"/></svg>';
      const cifra = el('span', 'nota__cifra', reducir ? String(nota) : '0');
      cifra.dataset.objetivo = String(nota);
      item.append(cifra, el('span', 'solo-lector', ' de 100'), el('span', 'nota__nombre', nombre), el('span', 'nota__nivel', NIVELES[nivelNota]));
      return item;
    }));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lista.querySelectorAll('.nota').forEach((item) => {
        const cifra = $('.nota__cifra', item);
        const objetivo = Number(cifra.dataset.objetivo);
        item.style.setProperty('--valor', String(objetivo));
        if (reducir) return;
        const t0 = performance.now();
        const paso = (t) => {
          const p = Math.min(1, (t - t0) / 1100);
          cifra.textContent = String(Math.round(objetivo * (1 - (1 - p) ** 3)));
          if (p < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      });
    }));
  };

  const pintarEspera = (informe) => {
    const lcp = informe.audits['largest-contentful-paint']?.numericValue;
    const bloque = $('[data-espera]');
    bloque.hidden = !lcp;
    if (!lcp) return;
    $('[data-lcp]').textContent = segundos(lcp);
    const rapida = lcp <= LCP_RAPIDO;
    bloque.dataset.nivel = rapida ? 'bien' : lcp <= 4000 ? 'mejorable' : 'mal';
    $('[data-lcp-texto]').textContent = rapida
      ? 'es lo que tarda en enseñar lo importante en un móvil. Está dentro de lo que Google considera rápido.'
      : 'es lo que tarda en enseñar lo importante en un móvil. Google considera rápida una web que lo hace en menos de 2,5 s.';
    $('[data-lcp-fuente]').textContent = lcp > 3000
      ? 'Según Google, más de la mitad de las visitas desde el móvil se van si la página tarda más de 3 segundos en cargar.'
      : '';
  };

  const pintarArreglos = (informe) => {
    const encontrados = ARREGLOS.filter(([ids]) => ids.some((id) => falla(informe.audits[id]))).slice(0, MAX_ARREGLOS);
    const items = encontrados.map(([, problema, solucion], i) => {
      const item = el('li', 'arreglo');
      item.style.setProperty('--i', String(i));
      item.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
      const texto = el('div');
      texto.append(el('strong', '', problema), el('p', '', solucion));
      item.append(texto);
      return item;
    });
    if (!items.length) {
      const item = el('li', 'arreglo');
      item.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
      const texto = el('div');
      texto.append(el('strong', '', 'No le veo fallos graves'), el('p', '', 'Lo que sí le añadiría: un agente de IA que conteste mensajes y reserve citas por ti, también de noche.'));
      item.append(texto);
      items.push(item);
    }
    $('[data-arreglos]').replaceChildren(...items);
  };

  const pintarVeredicto = (informe) => {
    const notas = NOTAS.map(([clave]) => (informe.categories[clave]?.score ?? 0) * 100);
    const velocidad = notas[0];
    $('[data-veredicto]').textContent = Math.min(...notas) >= 90
      ? 'Está en buena forma. Aun así, esto es lo que le haría.'
      : velocidad < 50
        ? 'Va lenta en el móvil: muchos clientes se irán antes de verla entera.'
        : 'Funciona, pero tiene varias cosas que mejorar.';
  };

  const mostrarInforme = (informe, url) => {
    const dominio = nombreVisible(url);
    $('[data-dominio]').textContent = dominio;
    pintarVeredicto(informe);
    pintarEspera(informe);
    pintarArreglos(informe);
    diagnostico.hidden = false;
    pintarNotas(informe);

    const velocidad = Math.round((informe.categories.performance?.score ?? 0) * 100);
    const lcp = informe.audits['largest-contentful-paint']?.numericValue;
    ctaRenovar.href = enlaceWa(`Hola Miguel, he hecho la radiografía de ${dominio}: velocidad en el móvil ${velocidad}/100${lcp ? ` y tarda ${segundos(lcp)} s en verse` : ''}. Quiero renovarla.`);
    if (lcp) {
      reloj.textContent = `${segundos(lcp)} s hasta verse`;
      seccion.dataset.estado = 'listo';
      seccion.dataset.nivel = lcp <= LCP_RAPIDO ? 'bien' : lcp <= 4000 ? 'mejorable' : 'mal';
    } else {
      seccion.dataset.estado = 'listo';
    }
    estadoTexto.textContent = `Así se ve ${dominio} en un móvil.`;

    const titulo = $('#titulo-diagnostico');
    titulo.setAttribute('tabindex', '-1');
    diagnostico.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    titulo.focus({ preventScroll: true });
  };

  const MOTIVOS = {
    cuota: 'Google está recibiendo demasiadas consultas ahora mismo. Prueba otra vez en un rato o mándamela y la reviso yo hoy mismo.',
    web: 'No he podido abrir esa dirección. Revisa que esté bien escrita o mándamela y la miro yo.',
    red: 'Se ha cortado la conexión o Google ha tardado demasiado. Prueba otra vez o mándamela y la reviso yo.',
    google: 'La herramienta de Google ha dado un error. Prueba otra vez o mándamela y la reviso yo.',
  };
  const mostrarPlanB = (tipo, url) => {
    seccion.dataset.estado = 'reposo';
    estadoTexto.textContent = TEXTO_REPOSO;
    $('[data-plan-b-motivo]').textContent = MOTIVOS[tipo] || MOTIVOS.google;
    const dominio = nombreVisible(url);
    $('[data-plan-b-cta]').href = enlaceWa(`Hola Miguel, quiero renovar mi web ${dominio}. ¿Me haces la radiografía?`);
    ctaRenovar.href = enlaceWa(`Hola Miguel, quiero renovar mi web ${dominio}.`);
    planB.hidden = false;
    planB.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'center' });
  };

  let enCurso = false;
  const radiografia = async (url) => {
    if (enCurso) return;
    enCurso = true;
    empezarEscaneo();
    try {
      const informe = await pedirInforme(url);
      terminarEscaneo();
      await reproducirCarga(informe);
      mostrarInforme(informe, url);
      history.replaceState(null, '', `?web=${encodeURIComponent(nombreVisible(url))}`);
    } catch (error) {
      terminarEscaneo();
      mostrarPlanB(error.tipo, url);
    } finally {
      enCurso = false;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = normalizar(campo.value);
    if (!url) {
      avisoCampo.textContent = 'Escribe la dirección de tu web, por ejemplo tunegocio.es';
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }
    avisoCampo.textContent = '';
    campo.removeAttribute('aria-invalid');
    campo.value = nombreVisible(url);
    radiografia(url);
  });
  campo.addEventListener('input', () => {
    if (!campo.hasAttribute('aria-invalid')) return;
    avisoCampo.textContent = '';
    campo.removeAttribute('aria-invalid');
  });

  // renovar?web=tunegocio.es abre la página con la radiografía ya en marcha (útil para mandársela a un cliente).
  const inicial = normalizar(new URLSearchParams(location.search).get('web') || '');
  if (inicial) {
    campo.value = nombreVisible(inicial);
    radiografia(inicial);
  }
})();
