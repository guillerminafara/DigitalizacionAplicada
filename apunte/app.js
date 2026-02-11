(function () {
  // Elementos de UI
  const displaySelect = document.getElementById('displaySelect');

  const flexGroup = document.getElementById('flexGroup');
  const flexDirection = document.getElementById('flexDirection');
  const justifyContent = document.getElementById('justifyContent');
  const alignItems = document.getElementById('alignItems');
  const flexWrap = document.getElementById('flexWrap');
  const gapValue = document.getElementById('gapValue');
  const gapUnit = document.getElementById('gapUnit');

  const positionSelect = document.getElementById('positionSelect');
  const offsetsGroup = document.getElementById('offsetsGroup');
  const topValue = document.getElementById('topValue');
  const topUnit = document.getElementById('topUnit');
  const rightValue = document.getElementById('rightValue');
  const rightUnit = document.getElementById('rightUnit');
  const bottomValue = document.getElementById('bottomValue');
  const bottomUnit = document.getElementById('bottomUnit');
  const leftValue = document.getElementById('leftValue');
  const leftUnit = document.getElementById('leftUnit');

  const customCss = document.getElementById('customCss');

  const cssOutput = document.getElementById('cssOutput');
  const copyBtn = document.getElementById('copyBtn');

  const generatedStyleTag = document.getElementById('generatedStyle');
  const previewBox = document.getElementById('previewBox');
  const previewStage = document.getElementById('previewStage');

  // Estado inicial
  const state = {
    display: displaySelect.value,
    flex: {
      direction: flexDirection.value,
      justify: justifyContent.value,
      alignItems: alignItems.value,
      wrap: flexWrap.value,
      gap: '', // sin valor por defecto
    },
    position: positionSelect.value,
    offsets: {
      top: '',
      right: '',
      bottom: '',
      left: '',
    },
    custom: '',
  };

  function withUnit(value, unit) {
    if (value === '' || value === null || Number.isNaN(Number(value))) return '';
    return `${value}${unit}`;
  }

  function normalizeCustomDeclarations(text) {
    // Toma varias líneas con "prop: valor" y asegura ; al final
    // Ignora líneas vacías y comentarios CSS existentes
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleaned = lines.map(line => {
      // permite comentarios
      if (line.startsWith('/*') || line.startsWith('//')) return null;
      // si ya tiene llaves, lo dejamos tal cual en salida posterior (pero aquí lo omitimos para no romper el bloque)
      if (line.includes('{') || line.includes('}')) return null;
      if (!line.includes(':')) return null;
      return line.endsWith(';') ? line : `${line};`;
    }).filter(Boolean);
    return cleaned.join('\n  ');
  }

  function buildCss() {
    const declarations = [];

    // display
    declarations.push(`display: ${state.display};`);

    // flex sólo si corresponde
    if (state.display.includes('flex')) {
      declarations.push(`flex-direction: ${state.flex.direction};`);
      declarations.push(`justify-content: ${state.flex.justify};`);
      declarations.push(`align-items: ${state.flex.alignItems};`);
      declarations.push(`flex-wrap: ${state.flex.wrap};`);
      if (state.flex.gap) declarations.push(`gap: ${state.flex.gap};`);
    } else {
      // gap aplica también a grid; si se indicó gap y no es flex, lo añadimos igual
      if (state.flex.gap) declarations.push(`gap: ${state.flex.gap};`);
    }

    // position
    declarations.push(`position: ${state.position};`);

    // offsets sólo si tienen valor
    if (state.offsets.top) declarations.push(`top: ${state.offsets.top};`);
    if (state.offsets.right) declarations.push(`right: ${state.offsets.right};`);
    if (state.offsets.bottom) declarations.push(`bottom: ${state.offsets.bottom};`);
    if (state.offsets.left) declarations.push(`left: ${state.offsets.left};`);

    // CSS personalizado como declaraciones adicionales
    const customDecl = normalizeCustomDeclarations(state.custom);

    const bodyLines = declarations.map(d => `  ${d}`).join('\n') +
      (customDecl ? `\n  /* CSS personalizado */\n  ${customDecl}` : '');

    const block = `#previewBox {\n${bodyLines}\n}`;
    return block;
  }

  function renderCss() {
    const css = buildCss();
    // Aplica a la vista previa
    generatedStyleTag.textContent = css;
    // Muestra en la zona de salida
    cssOutput.textContent = css;
  }

  function updateState() {
    state.display = displaySelect.value;

    state.flex.direction = flexDirection.value;
    state.flex.justify = justifyContent.value;
    state.flex.alignItems = alignItems.value;
    state.flex.wrap = flexWrap.value;

    const gap = gapValue.value.trim();
    state.flex.gap = gap !== '' ? withUnit(gap, gapUnit.value) : '';

    state.position = positionSelect.value;

    const tv = topValue.value.trim();
    const rv = rightValue.value.trim();
    const bv = bottomValue.value.trim();
    const lv = leftValue.value.trim();

    state.offsets.top = tv !== '' ? withUnit(tv, topUnit.value) : '';
    state.offsets.right = rv !== '' ? withUnit(rv, rightUnit.value) : '';
    state.offsets.bottom = bv !== '' ? withUnit(bv, bottomUnit.value) : '';
    state.offsets.left = lv !== '' ? withUnit(lv, leftUnit.value) : '';

    state.custom = customCss.value;
  }

  function updateUIVisibility() {
    const isFlex = displaySelect.value.includes('flex');
    flexGroup.style.display = isFlex ? '' : '';
    // mantenemos el grupo visible para permitir gap en grid; deshabilitamos props de flex si no aplica
    flexDirection.disabled = !isFlex;
    justifyContent.disabled = !isFlex;
    alignItems.disabled = !isFlex;
    flexWrap.disabled = !isFlex;

    // offsets visibles siempre; su efecto depende de position
    const disableOffsets = positionSelect.value === 'static';
    [topValue, rightValue, bottomValue, leftValue, topUnit, rightUnit, bottomUnit, leftUnit]
      .forEach(el => el.disabled = disableOffsets);
    offsetsGroup.style.opacity = disableOffsets ? 0.6 : 1;
  }

  // Eventos
  [
    displaySelect,
    flexDirection, justifyContent, alignItems, flexWrap,
    gapValue, gapUnit,
    positionSelect,
    topValue, topUnit, rightValue, rightUnit, bottomValue, bottomUnit, leftValue, leftUnit,
    customCss
  ].forEach(el => {
    const evt = (el.tagName === 'SELECT' || el === gapUnit || el === topUnit) ? 'change' : 'input';
    el.addEventListener(evt, () => {
      updateState();
      updateUIVisibility();
      renderCss();
    });
  });

  copyBtn.addEventListener('click', async () => {
    const text = cssOutput.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => (copyBtn.textContent = 'Copiar CSS'), 1200);
    } catch {
      // Fallback: selección manual
      const range = document.createRange();
      range.selectNodeContents(cssOutput);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try {
        document.execCommand('copy');
        copyBtn.textContent = '¡Copiado!';
      } catch {
        copyBtn.textContent = 'Seleccionado';
      }
      setTimeout(() => (copyBtn.textContent = 'Copiar CSS'), 1200);
      sel.removeAllRanges();
    }
  });

  // Arrastrar el previewBox si está absolute/fixed
  (function enableDrag() {
    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    function onPointerDown(e) {
      const isDraggable = ['absolute', 'fixed'].includes(state.position);
      if (!isDraggable) return;

      dragging = true;
      previewBox.setPointerCapture(e.pointerId);

      const rect = previewBox.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;

      // calcular posición actual relativa al stage
      const stageRect = previewStage.getBoundingClientRect();
      startLeft = rect.left - stageRect.left + previewStage.scrollLeft;
      startTop = rect.top - stageRect.top + previewStage.scrollTop;
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Aplicamos como px
      state.offsets.left = `${Math.round(startLeft + dx)}px`;
      state.offsets.top = `${Math.round(startTop + dy)}px`;

      // reflejar inputs si no están deshabilitados
      leftValue.value = parseInt(state.offsets.left, 10);
      leftUnit.value = 'px';
      topValue.value = parseInt(state.offsets.top, 10);
      topUnit.value = 'px';

      renderCss();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      previewBox.releasePointerCapture(e.pointerId);
    }

    previewBox.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  })();

  // Inicialización
  updateState();
  updateUIVisibility();
  renderCss();
})();