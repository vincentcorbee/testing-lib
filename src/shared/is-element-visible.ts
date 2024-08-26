export function isElementVisble(element: HTMLElement) {
  let target: HTMLElement | null = element;

  while (target) {
    if (!document.contains(target)) return false;

    const { display, overflowX, overflowY, overflow } = getComputedStyle(target);

    if (display === 'none') return false;

    const { width, height } = target.getBoundingClientRect();

    const { parentElement } = target;

    if (height === 0 || width === 0) {
      if (overflow === 'hidden') return false;

      if (width !== 0 && overflowX === 'hidden') return false;

      if (height !== 0 && overflowY === 'hidden') return false;
    }

    target = parentElement;
  }

  return true;
}
