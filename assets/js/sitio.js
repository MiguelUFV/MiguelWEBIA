(() => {
  'use strict';

  const TELEFONO_WA = '34685101194';
  const GA_ID = 'G-G00TCQQY14';
  const CLAVE_COOKIES = 'cookie-consent';
  const CLAVE_FECHA = 'cookie-consent-fecha';
  const VALIDEZ_CONSENTIMIENTO = 365 * 24 * 60 * 60 * 1000;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const enlaceWa = (texto) => `https://wa.me/${TELEFONO_WA}?text=${encodeURIComponent(texto)}`;
  const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const horaMinutos = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const el = (tag, clase, texto) => {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  };

  const analitica = {
    activa: false,
    evento(nombre, datos = {}) { if (this.activa && window.gtag) window.gtag('event', nombre, datos); },
  };

  const ESTILOS = { clasico: 'Clásico', moderno: 'Moderno', rotulo: 'Rótulo' };

  const SECTORES = {
    barberia: {
      etiqueta: 'barbería', nombre: 'Barbería Ramírez', estilo: 'rotulo',
      lema: (z) => `Degradados y barbas sin esperas en ${z || 'tu barrio'}.`,
      cta: 'Reservar cita', horario: 'Hoy de 10:00 a 20:30',
      carta: [['Corte degradado', '14 €'], ['Arreglo de barba', '9 €'], ['Corte + barba', '20 €']],
      saludo: '¡Hola! ¿Te busco hueco para hoy o mañana?',
      paletas: [['Negro y oro', '#16130F', '#F3EDE2', '#C9A55A', '#16130F'], ['Rojo barbero', '#F7F2EA', '#1D1A16', '#B3261E', '#FFFFFF'], ['Azul noche', '#0E1726', '#E9EEF7', '#5B8DEF', '#0E1726'], ['Verde botella', '#0F2A22', '#EAF2EC', '#D4A94F', '#0F2A22']],
      calc: { perdidos: 10, ticket: 20, visitas: 10 },
      chat: [
        ['cliente', '¿Tenéis hueco mañana por la tarde?'],
        ['agente', '¡Claro! Mañana tengo libre a las 17:30 y a las 18:15. ¿Cuál te va mejor?'],
        ['cliente', 'A las 17:30'],
        ['agente', 'Hecho ✅ Te espero mañana a las 17:30 para un corte degradado. Te mando un recordatorio 2 horas antes.'],
      ],
      aviso: ['Nueva cita en tu calendario', 'Mañana a las 17:30, corte degradado'],
    },
    peluqueria: {
      etiqueta: 'peluquería', nombre: 'Peluquería Lola', estilo: 'moderno',
      lema: (z) => `Color, corte y peinados en ${z || 'tu barrio'}, sin esperas.`,
      cta: 'Pedir cita', horario: 'Hoy de 9:30 a 20:00',
      carta: [['Corte y peinado', '28 €'], ['Mechas balayage', '85 €'], ['Tratamiento de keratina', '120 €']],
      saludo: '¡Hola! ¿Qué te hacemos y cuándo te viene bien?',
      paletas: [['Rosa empolvado', '#FFF4F4', '#3D1F2B', '#C2527A', '#FFFFFF'], ['Negro elegante', '#141414', '#F5EFEA', '#D8B07A', '#141414'], ['Salvia', '#F2F5F0', '#23321F', '#5E7A55', '#FFFFFF'], ['Lavanda', '#F6F2FB', '#2E2442', '#8A63C9', '#FFFFFF']],
      calc: { perdidos: 10, ticket: 35, visitas: 6 },
      chat: [
        ['cliente', 'Hola, ¿tenéis hueco el viernes para mechas?'],
        ['agente', '¡Hola! El viernes tengo a las 11:00 o a las 16:30. Las mechas llevan unas dos horas y media. ¿Cuál te va mejor?'],
        ['cliente', 'A las 16:30'],
        ['agente', 'Reservado ✅ Viernes a las 16:30, mechas. Te mando un recordatorio el día antes.'],
      ],
      aviso: ['Nueva cita en tu calendario', 'Viernes a las 16:30, mechas'],
    },
    restaurante: {
      etiqueta: 'restaurante', nombre: 'Casa Lucía', estilo: 'clasico',
      lema: (z) => `Cocina de mercado en ${z || 'el centro'}, con terraza todo el año.`,
      cta: 'Reservar mesa', horario: 'Hoy de 13:00 a 16:30 y de 20:00 a 23:30',
      carta: [['Menú del día', '14,50 €'], ['Cochinillo asado', '24 €'], ['Tarta de queso', '6,50 €']],
      saludo: '¡Hola! ¿Para cuántos te reservo mesa?',
      paletas: [['Mantel rojo', '#FFF7EC', '#3A1D12', '#B7322A', '#FFFFFF'], ['Aceituna', '#F4F1E6', '#2C3317', '#5B6B2E', '#FFFFFF'], ['Noche', '#1C1512', '#F4E8DA', '#E0874B', '#1C1512'], ['Mar', '#EEF5F7', '#0F2F3A', '#1F7A8C', '#FFFFFF']],
      calc: { perdidos: 15, ticket: 30, visitas: 4 },
      chat: [
        ['cliente', '¿Tenéis mesa para 4 el sábado a las 21:30?'],
        ['agente', '¡Sí! Me queda una mesa para 4 a las 21:30 en la terraza, o a las 22:00 dentro. ¿Cuál prefieres?'],
        ['cliente', 'Terraza, perfecto'],
        ['agente', 'Reservado ✅ Sábado a las 21:30, mesa para 4 en la terraza. Si cambiáis de planes, escríbeme por aquí.'],
      ],
      aviso: ['Nueva reserva', 'Sábado a las 21:30, mesa para 4 en terraza'],
    },
    clinica: {
      etiqueta: 'clínica', nombre: 'Clínica Dental Olmo', estilo: 'moderno',
      lema: (z) => `Tu dentista de confianza en ${z || 'tu barrio'}, sin listas de espera.`,
      cta: 'Pedir cita', horario: 'Hoy de 9:00 a 20:00',
      carta: [['Primera visita', 'Gratis'], ['Limpieza dental', '45 €'], ['Blanqueamiento', '190 €']],
      saludo: '¡Hola! ¿Te busco cita para esta semana?',
      paletas: [['Menta', '#F1FAF7', '#0E3B43', '#0E8C78', '#FFFFFF'], ['Azul clínico', '#F2F6FD', '#0F2A4A', '#2563EB', '#FFFFFF'], ['Lavanda', '#F6F4FB', '#2B2350', '#6D5BD0', '#FFFFFF'], ['Arena', '#FBF7F1', '#3B2F24', '#B7793A', '#FFFFFF']],
      calc: { perdidos: 8, ticket: 60, visitas: 2 },
      chat: [
        ['cliente', 'Hola, ¿me podéis ver esta semana para una limpieza?'],
        ['agente', '¡Hola! Tengo hueco el jueves a las 10:00 o el viernes a las 16:30. ¿Te reservo alguno?'],
        ['cliente', 'El jueves a las 10:00'],
        ['agente', 'Cita confirmada ✅ Jueves a las 10:00, limpieza dental. Te llegará un recordatorio el día antes.'],
      ],
      aviso: ['Nueva cita en tu calendario', 'Jueves a las 10:00, limpieza dental'],
    },
    taller: {
      etiqueta: 'taller', nombre: 'Talleres Moreno', estilo: 'rotulo',
      lema: (z) => `Mecánica rápida en ${z || 'tu zona'}, con precio cerrado antes de empezar.`,
      cta: 'Pedir presupuesto', horario: 'Hoy de 8:30 a 19:00',
      carta: [['Cambio de aceite', '49 €'], ['Pre-ITV', '35 €'], ['Diagnosis', '30 €']],
      saludo: '¡Hola! Dime tu coche y te doy precio al momento.',
      paletas: [['Amarillo', '#1B1D22', '#F2F2EE', '#F5C518', '#1B1D22'], ['Rojo racing', '#151515', '#F5F5F5', '#E53935', '#FFFFFF'], ['Azul mono', '#EEF2F7', '#0D1B2A', '#1B4DDB', '#FFFFFF'], ['Naranja', '#202020', '#F6F1EA', '#FF7A1A', '#202020']],
      calc: { perdidos: 6, ticket: 120, visitas: 2 },
      chat: [
        ['cliente', '¿Cuánto cuesta cambiar el aceite a un Golf de 2016?'],
        ['agente', 'Para tu Golf sale en 49 €, filtro incluido. Mañana tengo hueco a las 9:00 o a las 12:30. ¿Te lo apunto?'],
        ['cliente', 'Mañana a las 9:00'],
        ['agente', 'Apuntado ✅ Mañana a las 9:00, cambio de aceite. Tardamos unos 45 minutos.'],
      ],
      aviso: ['Nueva cita en tu calendario', 'Mañana a las 9:00, cambio de aceite'],
    },
    panaderia: {
      etiqueta: 'panadería', nombre: 'Panadería Candela', estilo: 'clasico',
      lema: (z) => `Pan de masa madre recién hecho cada mañana en ${z || 'tu barrio'}.`,
      cta: 'Hacer un encargo', horario: 'Hoy de 7:30 a 14:30',
      carta: [['Barra de masa madre', '1,60 €'], ['Palmeritas (docena)', '6 €'], ['Roscón por encargo', '22 €']],
      saludo: '¡Hola! ¿Te guardo algo para mañana?',
      paletas: [['Horno', '#2B1B11', '#F7EBDD', '#E4A857', '#2B1B11'], ['Harina', '#FBF6EE', '#3E2A1C', '#B8742F', '#FFFFFF'], ['Pistacho', '#F3F4EA', '#2F3A1F', '#7A8F3A', '#FFFFFF'], ['Frambuesa', '#FFF5F6', '#4A1C27', '#C2415B', '#FFFFFF']],
      calc: { perdidos: 8, ticket: 10, visitas: 30 },
      chat: [
        ['cliente', '¿Puedo encargar un roscón para el domingo?'],
        ['agente', '¡Claro! ¿Lo quieres de nata, de trufa o sin relleno? Lo tendrás listo el domingo desde las 8:00.'],
        ['cliente', 'De nata'],
        ['agente', 'Encargado ✅ Roscón de nata para el domingo. Pásate desde las 8:00, estará a tu nombre.'],
      ],
      aviso: ['Nuevo encargo', 'Domingo desde las 8:00, roscón de nata'],
    },
    fontaneria: {
      etiqueta: 'fontanería', nombre: 'Fontanería Gómez', estilo: 'moderno',
      lema: (z) => `Urgencias 24 horas en ${z || 'toda la zona'} y presupuesto sin compromiso.`,
      cta: 'Llamar ahora', horario: 'Urgencias las 24 horas',
      carta: [['Desatasco', 'desde 60 €'], ['Cambio de grifo', 'desde 45 €'], ['Revisión de caldera', '70 €']],
      saludo: '¡Hola! ¿Es una urgencia? Te mando a alguien.',
      paletas: [['Azul agua', '#EAF2FF', '#0B2A55', '#1560D6', '#FFFFFF'], ['Urgencia', '#FFFFFF', '#1A1A1A', '#E11D2E', '#FFFFFF'], ['Marino', '#0B1B33', '#E8EFFA', '#38BDF8', '#0B1B33'], ['Cobre', '#F7F3EE', '#2A2320', '#B45F2B', '#FFFFFF']],
      calc: { perdidos: 12, ticket: 90, visitas: 1 },
      chat: [
        ['cliente', 'Se me ha roto una tubería y sale agua. ¿Podéis venir hoy?'],
        ['agente', 'Cierra la llave de paso general mientras tanto. Puedo mandarte un técnico en unos 40 minutos. ¿Me pasas tu dirección?'],
        ['cliente', 'Calle Alcalá 120, 3.º B'],
        ['agente', 'En camino ✅ Llegamos en unos 40 minutos. Te aviso cuando el técnico esté cerca.'],
      ],
      aviso: ['Nuevo aviso urgente', 'Hoy, en 40 minutos, Calle Alcalá 120'],
    },
  };
  const ORDEN = Object.keys(SECTORES);
  const PISTAS_SECTOR = [
    ['peluqueria', /pelu|salon|estilis|belleza|beauty|hair|unas|estetic/],
    ['barberia', /barber|barbe/],
    ['panaderia', /panad|horno|pasteler|obrador|bolleri|confiter| pan /],
    ['clinica', /clinic|dental|dentist|fisio|veterin|podolog|optic|psicolog|medic|salud/],
    ['taller', /taller|motor|auto|neumat|mecanic|chapa|garaje/],
    ['fontaneria', /fontaner|reforma|instalac|calefacc|electric|cerrajer|obras/],
    ['restaurante', /restaur|taberna|meson|asador|cafeter|bistro|pizzer|tasca|gastro|cocina|casa | bar /],
  ];
  const adivinarSector = (nombre) => {
    const texto = ` ${nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()} `;
    const pista = PISTAS_SECTOR.find(([, patron]) => patron.test(texto));
    return pista ? pista[0] : null;
  };
  const estado = { sector: 'barberia', nombre: '', zona: '', estilo: 'rotulo', paleta: 0 };
  const nombreActual = () => estado.nombre.trim() || SECTORES[estado.sector].nombre;

  /* ── Calculadora: cuánto dinero se pierde por no contestar ── */
  const calculadora = (() => {
    const form = $('[data-calculadora]');
    const panel = $('.fugas__resultado');
    if (!form || !panel) return { sugerirSector() {} };
    const { perdidos, ticket, visitas } = form.elements;
    const escribir = (nombre, valor) => $$(`[data-salida="${nombre}"]`).forEach((n) => { n.textContent = valor; });
    const cifra = $('[data-salida="mes"]', panel);
    const barraPerdida = $('[data-barra="perdida"]', panel);
    const barraCuota = $('[data-barra="agente"]', panel);
    const comparativa = $('[data-comparativa]', panel);
    const cta = $('[data-calc-cta]', panel);
    const PLANES = { agente: ['Web + Agente IA', 49], whatsapp: ['Todo en WhatsApp', 89] };
    const FUGAS = { 4: '1 de cada 4', 3: '1 de cada 3', 2: '1 de cada 2' };
    let tocada = false;
    let mostrado = 0;
    let objetivo = 0;
    let animacion = 0;

    const relleno = (input) => {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--relleno', `${pct}%`);
    };
    const contar = (destino) => {
      objetivo = destino;
      cancelAnimationFrame(animacion);
      if (reducir) { mostrado = destino; cifra.textContent = miles(destino); return; }
      const inicio = mostrado;
      const t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / 500);
        mostrado = Math.round(inicio + (destino - inicio) * (1 - (1 - p) ** 3));
        cifra.textContent = miles(mostrado);
        if (p < 1) animacion = requestAnimationFrame(paso);
      };
      animacion = requestAnimationFrame(paso);
    };

    const calcular = () => {
      const p = Number(perdidos.value);
      const t = Number(ticket.value);
      const v = Number(visitas.value);
      const divisor = Number(form.elements.fuga.value) || 3;
      const clientes = (p * 4.33) / divisor;
      const mes = Math.round((clientes * t) / 10) * 10;
      const [plan, cuota] = p >= 20 ? PLANES.whatsapp : PLANES.agente;
      const recuperar = Math.max(1, Math.ceil(cuota / t));
      const redondos = Math.max(1, Math.round(clientes));
      const maximo = Math.max(mes, cuota, 1);

      escribir('perdidos', p);
      escribir('ticket', `${t} €`);
      escribir('visitas', v);
      contar(mes);
      escribir('mini', `${miles(mes)} €`);
      escribir('clientes', redondos === 1 ? '1 cliente' : `${redondos} clientes`);
      escribir('barra-perdida', `${miles(mes)} €/mes`);
      escribir('barra-nombre', `Cuota del plan ${plan}`);
      escribir('barra-cuota', `${cuota} €/mes`);
      escribir('anio', miles(mes * 12));
      escribir('valor-cliente', miles(t * v));
      escribir('recuperar', recuperar === 1 ? '1 cliente al mes' : `${recuperar} clientes al mes`);
      escribir('plan', plan);
      escribir('formula', `${p} mensajes × 4,33 semanas × ${FUGAS[divisor]} × ${t} €`);
      barraPerdida.style.setProperty('--ancho', `${Math.max(2, (mes / maximo) * 100)}%`);
      barraCuota.style.setProperty('--ancho', `${Math.max(2, (cuota / maximo) * 100)}%`);
      comparativa.setAttribute('aria-label', `Pierdes unos ${miles(mes)} € al mes. El plan ${plan} cuesta ${cuota} € al mes.`);
      cta.href = enlaceWa(`Hola Miguel, he usado tu calculadora: con unos ${p} mensajes sin contestar a la semana pierdo unos ${miles(mes)} € al mes. Me interesa el plan ${plan}.`);
      [perdidos, ticket, visitas].forEach(relleno);
    };

    const aplicarSector = (clave) => {
      const { calc } = SECTORES[clave];
      perdidos.value = calc.perdidos;
      ticket.value = calc.ticket;
      visitas.value = calc.visitas;
      calcular();
    };

    $$('input[name="calc-sector"]', form).forEach((r) => r.addEventListener('change', () => { tocada = true; aplicarSector(r.value); }));
    [perdidos, ticket, visitas].forEach((i) => i.addEventListener('input', () => { tocada = true; calcular(); }));
    $$('input[name="fuga"]', form).forEach((r) => r.addEventListener('change', () => { tocada = true; calcular(); }));

    calcular();
    cancelAnimationFrame(animacion);
    mostrado = objetivo;
    cifra.textContent = miles(objetivo);

    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      mostrado = 0;
      contar(objetivo);
    }, { threshold: 0.4 }).observe(panel);

    return {
      sugerirSector(clave) {
        if (tocada) return;
        const radio = $(`input[name="calc-sector"][value="${clave}"]`, form);
        if (radio) radio.checked = true;
        aplicarSector(clave);
      },
    };
  })();

  /* ── Turno de noche: reloj real y conversación del agente ── */
  const noche = (() => {
    const seccion = $('#agente');
    if (!seccion) return { preparar() {} };
    const reloj = { h: $('[data-h]', seccion), m: $('[data-m-reloj]', seccion) };
    const franja = $('[data-franja]', seccion);
    const conversacion = $('[data-conversacion]', seccion);
    const chatNombre = $('[data-chat-nombre]', seccion);
    const chatInicial = $('[data-chat-inicial]', seccion);
    const aviso = $('[data-aviso]', seccion);
    const avisoTitulo = $('[data-aviso-titulo]', seccion);
    const avisoDetalle = $('[data-aviso-detalle]', seccion);
    let temporizadores = [];
    let sectorReproducido = null;

    const actualizarReloj = () => {
      const ahora = new Date();
      const [h, m] = horaMinutos(ahora).split(':');
      reloj.h.textContent = h;
      reloj.m.textContent = m;
      const hora = ahora.getHours();
      franja.textContent = hora >= 20 || hora < 9
        ? 'Tu negocio está cerrado. Y te acaba de escribir un cliente.'
        : 'Estás atendiendo a un cliente. Y te acaba de escribir otro.';
    };
    const burbuja = (quien, texto, hora) => {
      const nodo = el('div', `mensaje mensaje--${quien}`);
      nodo.append(el('p', '', texto), el('time', '', hora));
      conversacion.append(nodo);
    };
    const escribiendo = () => {
      const nodo = el('div', 'escribiendo');
      nodo.append(el('span'), el('span'), el('span'));
      conversacion.append(nodo);
      return nodo;
    };
    const mostrarAviso = (sector) => {
      avisoTitulo.textContent = sector.aviso[0];
      avisoDetalle.textContent = sector.aviso[1];
      aviso.dataset.visible = 'si';
    };
    const reproducir = () => {
      temporizadores.forEach(clearTimeout);
      temporizadores = [];
      conversacion.replaceChildren();
      aviso.dataset.visible = 'no';
      const sector = SECTORES[estado.sector];
      const hora = horaMinutos(new Date());
      if (reducir) {
        sector.chat.forEach(([quien, texto]) => burbuja(quien, texto, hora));
        mostrarAviso(sector);
        return;
      }
      let t = 400;
      sector.chat.forEach(([quien, texto]) => {
        if (quien === 'agente') {
          let indicador;
          temporizadores.push(setTimeout(() => { indicador = escribiendo(); }, t));
          t += 1400;
          temporizadores.push(setTimeout(() => { indicador?.remove(); burbuja(quien, texto, hora); }, t));
        } else {
          temporizadores.push(setTimeout(() => burbuja(quien, texto, hora), t));
        }
        t += 1000;
      });
      temporizadores.push(setTimeout(() => mostrarAviso(sector), t));
    };

    actualizarReloj();
    setInterval(actualizarReloj, 20000);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && sectorReproducido !== estado.sector) {
        sectorReproducido = estado.sector;
        reproducir();
      }
    }, { threshold: 0.35 }).observe(seccion);

    return {
      preparar() {
        const nombre = nombreActual();
        chatNombre.textContent = nombre;
        chatInicial.textContent = nombre.charAt(0).toUpperCase();
      },
    };
  })();

  /* ── Simulador: la web del visitante se construye delante de él ── */
  (() => {
    const maqueta = $('.maqueta');
    const form = $('[data-probador]');
    if (!maqueta || !form) return;
    const entradaNombre = form.elements.nombre;
    const entradaZona = form.elements.zona;
    const radiosSector = $$('input[name="sector"]', form);
    const radiosEstilo = $$('input[name="estilo"]', form);
    const cajaColores = $('[data-colores]', form);
    const botonCrear = $('[data-crear]', form);
    const h1Nombre = $('[data-h1-nombre]');
    const pantalla = $('.maqueta__pantalla', maqueta);
    const web = $('.maqueta__web', maqueta);
    const lienzo = $('[data-confeti]', maqueta);
    const lista = $('[data-lista]');
    const listaDominio = $('[data-lista-dominio]');
    const ctaLista = $('#cta-lista');
    const avisoLector = $('[data-aviso-lector]');
    const panel = $('[data-obra]', maqueta);
    const panelTitulo = $('[data-obra-titulo]', panel);
    const panelCuenta = $('[data-obra-cuenta]', panel);
    const panelProgreso = $('[data-obra-progreso]', panel);
    const panelPasos = $('[data-obra-pasos]', panel);
    const panelIcono = $('[data-obra-icono]', panel);
    const bloques = Object.fromEntries($$('[data-bloque]', maqueta).map((b) => [b.dataset.bloque, b]));
    const m = (nombre) => $(`[data-m="${nombre}"]`, maqueta);
    const c = {
      url: m('url'), marca: m('marca'), titular: m('titular'), lema: m('lema'), cta: m('cta'),
      carta: m('carta'), saludo: m('saludo'), zona: m('zona'), horario: m('horario'), iniciales: m('iniciales'),
    };
    const control = { tocado: false, construyendo: false, estiloElegido: false, sectorElegido: false };
    const tecleos = new WeakMap();
    let temporizadores = [];
    let demo = null;

    const dominio = (nombre) => {
      const base = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return `${base || 'tunegocio'}.es`;
    };
    const iniciales = (nombre) => {
      const palabras = nombre.split(/\s+/).filter((w) => w && !/^(de|del|la|las|el|los|y|e)$/i.test(w));
      return (palabras.slice(0, 2).map((w) => w.charAt(0)).join('') || 'TN').toUpperCase();
    };
    const fijar = (nodo, texto) => { clearInterval(tecleos.get(nodo)); nodo.textContent = texto; };
    const teclear = (nodo, texto, duracion = 720) => {
      clearInterval(tecleos.get(nodo));
      if (reducir) { nodo.textContent = texto; return; }
      let i = 0;
      nodo.textContent = '';
      const id = setInterval(() => {
        i += 1;
        nodo.textContent = texto.slice(0, i);
        if (i >= texto.length) clearInterval(id);
      }, Math.max(22, Math.min(60, duracion / Math.max(1, texto.length))));
      tecleos.set(nodo, id);
    };
    const reanimar = () => {
      if (reducir) return;
      delete maqueta.dataset.cambiando;
      void maqueta.offsetWidth;
      maqueta.dataset.cambiando = '';
    };
    const desplazarA = (bloque) => {
      const maximo = Math.max(0, web.scrollHeight - pantalla.clientHeight);
      const destino = bloque ? Math.min(maximo, Math.max(0, bloque.offsetTop - 24)) : 0;
      maqueta.style.setProperty('--desplazamiento', `${destino}px`);
    };

    const aplicarPaleta = () => {
      const [, fondo, texto, acento, textoAcento] = SECTORES[estado.sector].paletas[estado.paleta];
      maqueta.style.setProperty('--m-bg', fondo);
      maqueta.style.setProperty('--m-fg', texto);
      maqueta.style.setProperty('--m-acc', acento);
      maqueta.style.setProperty('--m-acc-texto', textoAcento);
    };

    const actualizarEnlaces = () => {
      const sector = SECTORES[estado.sector];
      const propio = estado.nombre.trim();
      const zona = estado.zona.trim();
      const color = sector.paletas[estado.paleta][0].toLowerCase();
      ctaLista.href = enlaceWa([
        'Hola Miguel, acabo de diseñar mi web en paginawebcreator.com:',
        `· Negocio: ${propio || `mi ${sector.etiqueta}`} (${sector.etiqueta}${zona ? `, ${zona}` : ''})`,
        `· Estilo: ${ESTILOS[estado.estilo]}, color ${color}`,
        '¿Me preparas la versión de verdad?',
      ].join('\n'));
      listaDominio.textContent = dominio(nombreActual());
    };

    const pintar = ({ animar = false } = {}) => {
      const sector = SECTORES[estado.sector];
      const nombre = nombreActual();
      const zona = estado.zona.trim();
      const propio = estado.nombre.trim();
      maqueta.dataset.sector = estado.sector;
      maqueta.dataset.estilo = estado.estilo;
      aplicarPaleta();
      if (!control.construyendo) fijar(c.url, dominio(nombre));
      c.marca.textContent = nombre;
      c.iniciales.textContent = iniciales(nombre);
      if (animar) { teclear(c.titular, nombre); reanimar(); } else fijar(c.titular, nombre);
      c.lema.textContent = sector.lema(zona);
      c.cta.textContent = sector.cta;
      c.saludo.textContent = sector.saludo;
      c.zona.textContent = zona ? `En ${zona}` : 'En tu barrio, con mapa';
      c.horario.textContent = sector.horario;
      c.carta.replaceChildren(...sector.carta.map(([servicio, precio]) => {
        const li = el('li');
        li.append(el('span', '', servicio), el('span', '', precio));
        return li;
      }));
      h1Nombre.textContent = propio || 'Tu negocio';
      if (propio) h1Nombre.dataset.propio = ''; else delete h1Nombre.dataset.propio;
      actualizarEnlaces();
      noche.preparar();
    };

    const pararDemo = () => { clearInterval(demo); demo = null; };
    const tomarControl = () => {
      if (control.tocado) return;
      control.tocado = true;
      pararDemo();
    };

    const pintarColores = () => {
      cajaColores.replaceChildren(...SECTORES[estado.sector].paletas.map(([nombre, fondo, , acento], i) => {
        const etiqueta = el('label', 'color');
        const input = el('input');
        input.type = 'radio';
        input.name = 'color';
        input.value = String(i);
        input.checked = i === estado.paleta;
        input.addEventListener('change', () => {
          tomarControl();
          estado.paleta = i;
          aplicarPaleta();
          actualizarEnlaces();
        });
        const muestra = el('span', 'color__muestra');
        muestra.style.setProperty('--c1', fondo);
        muestra.style.setProperty('--c2', acento);
        etiqueta.append(input, muestra, el('span', 'solo-lector', nombre));
        return etiqueta;
      }));
    };

    const cambiarSector = (clave, { usuario = false } = {}) => {
      estado.sector = clave;
      estado.paleta = 0;
      if (!control.estiloElegido) estado.estilo = SECTORES[clave].estilo;
      radiosSector.forEach((r) => { r.checked = r.value === clave; });
      radiosEstilo.forEach((r) => { r.checked = r.value === estado.estilo; });
      pintarColores();
      pintar({ animar: true });
      if (usuario) calculadora.sugerirSector(clave);
    };

    const iniciarDemo = () => {
      if (reducir || control.tocado || demo) return;
      demo = setInterval(() => cambiarSector(ORDEN[(ORDEN.indexOf(estado.sector) + 1) % ORDEN.length]), 4200);
    };

    const confeti = () => {
      if (reducir || !lienzo.getContext) return;
      const ctx = lienzo.getContext('2d');
      const { width, height } = lienzo.getBoundingClientRect();
      const escala = Math.min(2, window.devicePixelRatio || 1);
      lienzo.width = width * escala;
      lienzo.height = height * escala;
      ctx.scale(escala, escala);
      const acento = getComputedStyle(maqueta).getPropertyValue('--m-acc').trim() || '#FFC53D';
      const colores = [acento, '#FFC53D', '#2346E6', '#25D366', '#FFFFFF'];
      const piezas = Array.from({ length: 90 }, () => ({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height * 0.4,
        vx: (Math.random() - 0.5) * 10,
        vy: -Math.random() * 9 - 4,
        g: 0.26 + Math.random() * 0.1,
        giro: Math.random() * Math.PI,
        vgiro: (Math.random() - 0.5) * 0.3,
        w: 5 + Math.random() * 5,
        h: 3 + Math.random() * 4,
        color: colores[Math.floor(Math.random() * colores.length)],
      }));
      const inicio = performance.now();
      const cuadro = (t) => {
        const vida = (t - inicio) / 1700;
        ctx.clearRect(0, 0, width, height);
        piezas.forEach((p) => {
          p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.giro += p.vgiro;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - vida);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.giro);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (vida < 1) requestAnimationFrame(cuadro); else ctx.clearRect(0, 0, width, height);
      };
      requestAnimationFrame(cuadro);
    };

    const luego = (ms, fn) => { temporizadores.push(setTimeout(fn, ms)); };

    const terminar = () => {
      const nombre = nombreActual();
      Object.values(bloques).forEach((b) => { b.dataset.listo = ''; });
      panelIcono.dataset.hecho = '';
      panelTitulo.textContent = '¡Tu web está lista!';
      panelProgreso.style.width = '100%';
      desplazarA(null);
      control.construyendo = false;
      teclear(c.url, dominio(nombre), 600);
      confeti();
      botonCrear.removeAttribute('aria-busy');
      botonCrear.textContent = 'Volver a crearla';
      actualizarEnlaces();
      lista.hidden = false;
      avisoLector.textContent = `Tu web de ejemplo, ${dominio(nombre)}, está lista.`;
      analitica.evento('web_creada', { sector: estado.sector, estilo: estado.estilo });
      if (window.matchMedia('(max-width: 959px)').matches) {
        luego(900, () => lista.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'nearest' }));
      }
      luego(1900, () => {
        panel.dataset.saliendo = '';
        luego(400, () => { panel.hidden = true; delete maqueta.dataset.construyendo; });
      });
    };

    const construir = () => {
      tomarControl();
      temporizadores.forEach(clearTimeout);
      temporizadores = [];
      const sector = SECTORES[estado.sector];
      const nombre = nombreActual();
      const zona = estado.zona.trim();
      const pasos = [
        ['nav', 'Colores y tipografía'],
        ['portada', `Textos para tu ${sector.etiqueta}`],
        ['carta', 'Servicios y precios'],
        ['resenas', 'Espacio para tus reseñas'],
        ['ubicacion', zona ? `SEO local en ${zona}` : 'SEO local para tu zona'],
        ['chat', 'Agente IA conectado'],
      ];
      control.construyendo = true;
      botonCrear.setAttribute('aria-busy', 'true');
      lista.hidden = true;
      maqueta.dataset.construyendo = '';
      Object.values(bloques).forEach((b) => { delete b.dataset.listo; });
      desplazarA(null);
      fijar(c.url, '');
      delete panel.dataset.saliendo;
      delete panelIcono.dataset.hecho;
      panel.hidden = false;
      panelTitulo.textContent = `Creando ${nombre}`;
      panelCuenta.textContent = `0/${pasos.length}`;
      panelProgreso.style.width = '0%';
      panelPasos.replaceChildren();

      if (reducir) { terminar(); return; }

      const ritmo = 640;
      pasos.forEach(([bloque, texto], i) => {
        luego(250 + i * ritmo, () => {
          const li = el('li', '', texto);
          panelPasos.append(li);
          while (panelPasos.children.length > 2) panelPasos.firstElementChild.remove();
          if (bloque === 'portada') teclear(c.titular, nombre, 520);
          if (bloque === 'carta' || bloque === 'resenas' || bloque === 'ubicacion') desplazarA(bloques[bloque]);
          luego(ritmo - 120, () => {
            li.dataset.hecho = '';
            bloques[bloque].dataset.listo = '';
            panelCuenta.textContent = `${i + 1}/${pasos.length}`;
            panelProgreso.style.width = `${((i + 1) / pasos.length) * 100}%`;
          });
        });
      });
      luego(250 + pasos.length * ritmo + 120, terminar);
    };

    const botonesVista = $$('button[data-vista]');
    const ponerVista = (vista) => {
      maqueta.dataset.vista = vista;
      botonesVista.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vista === vista)));
      maqueta.style.setProperty('--desplazamiento', '0px');
    };
    botonesVista.forEach((b) => b.addEventListener('click', () => ponerVista(b.dataset.vista)));

    form.addEventListener('focusin', tomarControl);
    form.addEventListener('pointerdown', tomarControl);
    entradaNombre.addEventListener('input', () => {
      estado.nombre = entradaNombre.value.slice(0, 32);
      const detectado = control.sectorElegido ? null : adivinarSector(estado.nombre);
      if (detectado && detectado !== estado.sector) cambiarSector(detectado, { usuario: true });
      else pintar();
    });
    entradaZona.addEventListener('input', () => { estado.zona = entradaZona.value.slice(0, 28); pintar(); });
    radiosSector.forEach((r) => r.addEventListener('change', () => {
      control.sectorElegido = true;
      cambiarSector(r.value, { usuario: true });
    }));
    radiosEstilo.forEach((r) => r.addEventListener('change', () => {
      control.estiloElegido = true;
      estado.estilo = r.value;
      pintar();
      reanimar();
      actualizarEnlaces();
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (control.construyendo) return;
      document.activeElement?.blur();
      if (window.matchMedia('(max-width: 959px)').matches) {
        $('.escaparate__maqueta').scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
        setTimeout(construir, reducir ? 0 : 500);
      } else {
        construir();
      }
    });

    if (window.matchMedia('(hover: hover)').matches) {
      pantalla.addEventListener('pointerenter', () => { if (!control.construyendo) desplazarA(bloques.ubicacion); });
      pantalla.addEventListener('pointerleave', () => { if (!control.construyendo) desplazarA(null); });
    }

    new IntersectionObserver(([e]) => (e.isIntersecting ? iniciarDemo() : pararDemo()), { threshold: 0.4 }).observe(maqueta);
    document.addEventListener('visibilitychange', () => (document.hidden ? pararDemo() : iniciarDemo()));

    ponerVista(window.matchMedia('(max-width: 639px)').matches ? 'movil' : 'ordenador');
    pintarColores();
    pintar();
  })();

  /* ── Revelado de secciones al hacer scroll ── */
  (() => {
    const persianas = $$('[data-persiana]');
    const hijos = $$('[data-escalonado]').flatMap((contenedor) => [...contenedor.children].map((h, i) => {
      h.style.setProperty('--i', String(i % 4));
      return h;
    }));
    const sueltos = [...$$('[data-revelar]'), ...hijos];
    if (reducir || !('IntersectionObserver' in window)) {
      [...persianas, ...sueltos].forEach((n) => n.classList.add('visto'));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    sueltos.forEach((n) => io.observe(n));

    // Un elemento recortado del todo no cuenta como visible: se vigila a su contenedor.
    const porContenedor = new Map();
    persianas.forEach((p) => {
      const padre = p.parentElement;
      porContenedor.set(padre, [...(porContenedor.get(padre) || []), p]);
    });
    const ioPersiana = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        porContenedor.get(e.target).forEach((p) => p.classList.add('visto'));
        ioPersiana.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    porContenedor.forEach((_, padre) => ioPersiana.observe(padre));
  })();

  /* ── Cabecera, menú móvil y barra de contacto ── */
  (() => {
    const cabecera = $('.cabecera');
    if (!cabecera) return;
    const marcarScroll = () => { cabecera.dataset.scroll = window.scrollY > 8 ? 'si' : 'no'; };
    window.addEventListener('scroll', marcarScroll, { passive: true });
    marcarScroll();

    const boton = $('.cabecera__menu');
    const nav = $('#menu-principal');
    if (boton && nav) {
      const cerrar = () => { boton.setAttribute('aria-expanded', 'false'); nav.dataset.abierto = 'false'; };
      boton.addEventListener('click', () => {
        const abrir = boton.getAttribute('aria-expanded') !== 'true';
        boton.setAttribute('aria-expanded', String(abrir));
        nav.dataset.abierto = String(abrir);
      });
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) cerrar(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    }

    const barra = $('.barra-contacto');
    if (barra) {
      const aLaVista = new Set();
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? aLaVista.add(e.target) : aLaVista.delete(e.target)));
        barra.dataset.visible = aLaVista.size ? 'no' : 'si';
      });
      [$('.escaparate'), $('#calculadora'), $('.mostrador')].forEach((s) => s && io.observe(s));
    }
  })();

  /* ── Cookies: Google Analytics solo con consentimiento ── */
  (() => {
    const aviso = $('.aviso-cookies');
    if (!aviso) return;
    const ajustes = $('[data-cookies-ajustes]', aviso);
    const casilla = $('[data-cookies-analitica]', aviso);
    const botonAjustes = $('.aviso-cookies__configurar', aviso);
    let cargado = false;

    const leer = () => {
      try {
        const valor = localStorage.getItem(CLAVE_COOKIES);
        const fecha = Number(localStorage.getItem(CLAVE_FECHA));
        if (!valor || !fecha || Date.now() - fecha > VALIDEZ_CONSENTIMIENTO) return null;
        return valor;
      } catch { return null; }
    };
    const guardar = (valor) => {
      try {
        localStorage.setItem(CLAVE_COOKIES, valor);
        localStorage.setItem(CLAVE_FECHA, String(Date.now()));
      } catch { /* navegación privada: se volverá a preguntar */ }
    };
    const cargarAnalitica = () => {
      analitica.activa = true;
      if (cargado) { window.gtag('consent', 'update', { analytics_storage: 'granted' }); return; }
      cargado = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.append(script);
    };
    const borrarCookiesGA = () => {
      const dominio = location.hostname.replace(/^www\./, '');
      document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => n.startsWith('_ga')).forEach((n) => {
        document.cookie = `${n}=; Max-Age=0; path=/`;
        document.cookie = `${n}=; Max-Age=0; path=/; domain=.${dominio}`;
      });
    };
    const mostrarAjustes = (mostrar) => {
      ajustes.hidden = !mostrar;
      botonAjustes.setAttribute('aria-expanded', String(mostrar));
      botonAjustes.dataset.cookies = mostrar ? 'guardar' : 'ajustes';
      botonAjustes.textContent = mostrar ? 'Guardar mi selección' : 'Configurar';
      if (mostrar) casilla.checked = leer() === 'accepted';
    };
    const abrir = (conAjustes) => {
      aviso.hidden = false;
      mostrarAjustes(conAjustes);
      if (conAjustes) casilla.focus();
    };
    const decidir = (valor) => {
      guardar(valor);
      aviso.hidden = true;
      if (valor === 'accepted') {
        cargarAnalitica();
      } else {
        analitica.activa = false;
        if (cargado) window.gtag('consent', 'update', { analytics_storage: 'denied' });
        borrarCookiesGA();
      }
    };

    document.addEventListener('click', (e) => {
      const origen = e.target.closest('[data-cookies]');
      if (!origen) return;
      const accion = origen.dataset.cookies;
      if (accion === 'aceptar') decidir('accepted');
      else if (accion === 'rechazar') decidir('rejected');
      else if (accion === 'ajustes') mostrarAjustes(true);
      else if (accion === 'guardar') decidir(casilla.checked ? 'accepted' : 'rejected');
      else if (accion === 'configurar') abrir(true);
    });

    const previo = leer();
    if (previo === 'accepted') cargarAnalitica();
    else if (!previo) abrir(false);

    document.addEventListener('click', (e) => {
      const origen = e.target.closest('[data-evento]');
      if (origen) analitica.evento(origen.dataset.evento, { ubicacion: origen.dataset.ubicacion || '' });
    });
  })();

  const anio = $('[data-anio]');
  if (anio) anio.textContent = new Date().getFullYear();
})();
