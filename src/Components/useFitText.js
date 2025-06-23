import { useRef, useLayoutEffect, useState } from 'react';

/**
 * Hook para ajustar el tamaño de fuente de un texto para que quepa en una sola línea dentro de su contenedor.
 * Si no cabe, reducir.
 * Compatible con Chakra UI v3 y sin efectos colaterales en el DOM.
 * @param {number} maxFontSize Tamaño máximo de fuente en px
 * @param {number} minFontSize Tamaño mínimo de fuente en px
 * @returns {[React.RefObject, number]}
 */
export function useFitText(maxFontSize = 24, minFontSize = 12) {
  const ref = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize - 2);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const parent = node.parentElement;
    if (!parent) return;
    const text = node.textContent || '';
    const fontFamily = window.getComputedStyle(node).fontFamily;
    const fontWeight = window.getComputedStyle(node).fontWeight;
    const fontStyle = window.getComputedStyle(node).fontStyle;
    const parentWidth = parent.getBoundingClientRect().width;
    const measure = document.createElement('span');
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'nowrap';
    measure.style.pointerEvents = 'none';
    measure.style.fontFamily = fontFamily;
    measure.style.fontWeight = fontWeight;
    measure.style.fontStyle = fontStyle;
    measure.textContent = text;
    document.body.appendChild(measure);
    measure.style.fontSize = (maxFontSize - 2) + 'px';
    if (measure.offsetWidth <= parentWidth) {
      setFontSize(maxFontSize - 2);
      document.body.removeChild(measure);
      return;
    }
    // Si no cabe, reducir el tamaño de fuente
    let currentFont = maxFontSize - 2;
    let fits = false;
    while (currentFont >= minFontSize) {
      measure.style.fontSize = currentFont + 'px';
      if (measure.offsetWidth <= parentWidth) {
        fits = true;
        break;
      }
      currentFont -= 1;
    }
    setFontSize(fits ? currentFont : minFontSize);
    document.body.removeChild(measure);
  }, [maxFontSize, minFontSize, ref.current?.textContent]);

  return [ref, fontSize];
}
