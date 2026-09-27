/* ============================================================
   VÍVARA — Distribuidor Interactive Script
   - Curved Clock / Arc Carousel with tangential geometry
   - Drag & swipe with momentum physics (Emil Kowalski inspired)
   - Dynamic focal detail synchronization
   - Sector filtering & dynamic WhatsApp intent generation
   - FAQ smooth accordion
   ============================================================ */

(function () {
  'use strict';

  // Sector Data for the Clock Carousel & Details
  const SECTORS = [
    {
      id: 'minimarket',
      title: 'Minimarkets & Boutiques',
      tag: 'Alta Rotación',
      desc: 'Formato personal de 625ml y bidones prácticos listos para refrigerar. Atrae a clientes que valoran agua purificada y fresca al instante.',
      product: 'Botella 625ml (Caja x 15) · Bidón 11L',
      benefit: 'Margen comercial estimado: 35% - 45%',
      whatsappMsg: 'Hola, tengo un minimarket y me interesa conocer la lista de precios mayoristas y condiciones de distribución de Vívara.'
    },
    {
      id: 'bodega',
      title: 'Bodegas & Comercios',
      tag: 'Consumo Vecinal Frecuente',
      desc: 'El agua predilecta de los hogares. Su pureza de mesa osmotizada y ozonizada genera recompra semanal y máxima fidelidad de tus vecinos.',
      product: 'Bidón 20L retornable · Botella 625ml',
      benefit: 'Rotación semanal continua con recambio ágil',
      whatsappMsg: 'Hola, tengo una bodega/tienda de barrio y quisiera distribuir agua Vívara. ¿Me brindarían precios y requisitos?'
    },
    {
      id: 'restaurante',
      title: 'Restaurantes & Bistrós',
      tag: 'Elegancia en Mesa',
      desc: 'Botella con diseño sobrio y distinguido que realza tu montaje de mesa. Pureza neutra que acompaña a la perfección la experiencia culinaria.',
      product: 'Botella 625ml para comensales · Bidones para cocina',
      benefit: 'Excelente presentación y margen por servicio de mesa',
      whatsappMsg: 'Hola, represento a un restaurante/café y quisiéramos incorporar agua Vívara en nuestra carta. ¿Me comparten la cotización mayorista?'
    },
    {
      id: 'empresa',
      title: 'Empresas & Oficinas',
      tag: 'Bienestar Corporativo',
      desc: 'Agua osmotizada con pH 8.2 alcalino y control de calidad diario. Suministro puntual con facturación y soporte para dispensadores.',
      product: 'Bidón 20L retornable · Dispensadores frío/calor',
      benefit: 'Planes mensuales de reposición con entrega en oficina',
      whatsappMsg: 'Hola, soy de una empresa/oficina y deseamos contratar suministro continuo de agua Vívara para nuestros colaboradores. ¿Qué opciones tienen?'
    },
    {
      id: 'gimnasio',
      title: 'Gimnasios & Fitness',
      tag: 'Hidratación Deportiva',
      desc: 'Balance ideal de minerales para una hidratación rápida y liviana antes, durante y después de los entrenamientos más intensos.',
      product: 'Botella 625ml en vitrina deportiva · Bidón 20L',
      benefit: 'Alta venta por impulso en recepción y zonas de peso',
      whatsappMsg: 'Hola, administro un centro fitness/gimnasio y me gustaría vender agua Vívara a nuestros alumnos. ¿Me envían información?'
    },
    {
      id: 'cafeteria',
      title: 'Cafés de Especialidad',
      tag: 'Extracción & Pureza',
      desc: 'El TDS controlado y la pureza osmotizada aseguran que cada espresso y filtrado exprese las notas auténticas del grano de café.',
      product: 'Bidón 20L purificado para máquinas espresso',
      benefit: 'Protección de calderas y estandarización del sabor',
      whatsappMsg: 'Hola, tengo una cafetería de especialidad y busco agua purificada para nuestras máquinas de café. ¿Me comparten información técnica y precios?'
    }
  ];

  /* ------------------------------------------------------------
     1. CLOCK / ARC CAROUSEL WITH TANGENTIAL GEOMETRY
     ------------------------------------------------------------ */
  const track = document.getElementById('clockTrack');
  const viewport = document.getElementById('clockViewport');
  const dial = document.getElementById('clockDial');
  const btnPrev = document.getElementById('clockPrev');
  const btnNext = document.getElementById('clockNext');

  // Focal card elements
  const focalBadge = document.getElementById('focalBadge');
  const focalTitle = document.getElementById('focalTitle');
  const focalDesc = document.getElementById('focalDesc');
  const focalProduct = document.getElementById('focalProduct');
  const focalBenefit = document.getElementById('focalBenefit');
  const focalCta = document.getElementById('focalCta');

  if (track && viewport) {
    const cards = Array.from(track.querySelectorAll('.clock-card'));
    const totalCards = cards.length;
    const stepAngle = 20; // degrees between adjacent cards along the clock rim

    let currentAngle = 0; // in degrees
    let targetAngle = 0;
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;
    let dragDistance = 0;
    let isPaused = false;
    let lastTime = performance.now();
    let autoSpeed = 0.04; // degrees per frame
    let activeIndex = 0;

    // Update positions along radial arc
    function updateClockCards() {
      // Responsive radius based on viewport width
      const isMobile = window.innerWidth <= 768;
      const radius = isMobile ? 520 : 800;
      const arcCenterY = isMobile ? 620 : 860;

      cards.forEach((card, i) => {
        // Calculate relative angle centered around apex (0 degrees)
        let rawAngle = (currentAngle + i * stepAngle) % (totalCards * stepAngle);
        // Normalize between -(total * step / 2) and +(total * step / 2)
        const halfSpan = (totalCards * stepAngle) / 2;
        while (rawAngle > halfSpan) rawAngle -= totalCards * stepAngle;
        while (rawAngle < -halfSpan) rawAngle += totalCards * stepAngle;

        // Angle in radians for trigonometry
        const rad = (rawAngle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = arcCenterY - Math.cos(rad) * radius;

        // Tangential rotation matches the arc angle
        const rotation = rawAngle;

        // Scale and opacity falloff based on angular distance from apex
        const absAngle = Math.abs(rawAngle);
        let scale = 1 - (absAngle / 70) * 0.28;
        if (scale < 0.72) scale = 0.72;

        let opacity = 1 - (absAngle / 65) * 0.75;
        if (opacity < 0.15) opacity = 0.15;
        if (absAngle > 60) opacity = 0; // hide cards too far behind

        const isActive = absAngle < stepAngle / 2;
        if (isActive && activeIndex !== i) {
          activeIndex = i;
          updateFocalCard(i);
        }

        card.classList.toggle('is-active', isActive);
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
      });
    }

    function updateFocalCard(index) {
      const data = SECTORS[index % SECTORS.length];
      if (!data) return;

      if (focalBadge) focalBadge.textContent = data.tag;
      if (focalTitle) focalTitle.textContent = data.title;
      if (focalDesc) focalDesc.textContent = data.desc;

      if (focalCta) {
        const encoded = encodeURIComponent(data.whatsappMsg);
        focalCta.href = `https://wa.me/51983325632?text=${encoded}`;
      }
    }

    // Animation Loop
    function loop(now) {
      const dt = now - lastTime;
      lastTime = now;

      if (!isDragging) {
        if (!isPaused) {
          targetAngle -= autoSpeed * (dt / 16.6);
        }
        // Smooth lerp towards target angle (Emil Kowalski spring ease)
        currentAngle += (targetAngle - currentAngle) * 0.12;
      }

      updateClockCards();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Initial focal sync
    updateFocalCard(0);

    // Hover pauses auto-drift
    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { if (!isDragging) isPaused = false; });

    // Touch & Pointer Dragging
    viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      isPaused = true;
      startX = e.clientX;
      startAngle = currentAngle;
      dragDistance = 0;
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      dragDistance += Math.abs(dx);
      // Map pixel delta to rotation angle
      const sensitivity = 0.085;
      currentAngle = startAngle + dx * sensitivity;
      targetAngle = currentAngle;
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Snap to nearest card angle
      const nearestIndex = Math.round(-currentAngle / stepAngle);
      targetAngle = -nearestIndex * stepAngle;

      setTimeout(() => {
        isPaused = false;
      }, 1800);
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Click on individual card rotates it to top
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (dragDistance > 10) return; // ignore if dragging
        e.stopPropagation();
        rotateToIndex(index);
      });
    });

    function rotateToIndex(index) {
      // Find the shortest rotation to center card `index`
      const normalizedCurrent = currentAngle % (totalCards * stepAngle);
      const targetLocal = -index * stepAngle;
      let diff = targetLocal - (currentAngle % (totalCards * stepAngle));
      while (diff > (totalCards * stepAngle) / 2) diff -= totalCards * stepAngle;
      while (diff < -(totalCards * stepAngle) / 2) diff += totalCards * stepAngle;

      targetAngle = currentAngle + diff;
      isPaused = true;
      setTimeout(() => { isPaused = false; }, 3000);
    }

    // Step buttons
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        targetAngle += stepAngle;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, 2500);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        targetAngle -= stepAngle;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, 2500);
      });
    }

    if (dial) {
      dial.addEventListener('click', () => {
        targetAngle -= stepAngle;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, 2500);
      });
    }

    // Recalculate on window resize
    window.addEventListener('resize', updateClockCards, { passive: true });
  }

})();
