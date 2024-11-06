import { runTest } from '../run-test.js';
import { append, createElement } from '../utils/index.js';
import { css } from './file-explorer.css.js';

class FileExplorer extends HTMLElement {
  constructor() {
    super();
  }

  static observedAttributes = ['tests'];

  #started = false;

  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case 'tests':
        const tests = JSON.parse(newValue);

        this.#content.innerHTML = '';
        this.#content.appendChild(this.#createList(tests));
        break;
      default:
        break;
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: 'open' });

      const style = createElement('style', { textContent: css });
      const container = createElement('div', { className: 'ui-file-explorer__container' });
      const content = createElement('div', { className: 'ui-file-explorer__content' });
      const header = createElement('div', { className: 'ui-file-explorer__header' });
      const buttons = createElement('div', { className: 'ui-file-explorer__buttons' });
      const minButton = createElement('button', { className: 'ui-file-explorer__min-button' });
      const link = createElement('link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=folder_open',
      });

      const onStarted = () => {
        this.#started = true;

        console.log('started');
      };

      const onCompleted = (result) => {
        this.#started = false;

        console.log('completed');
      };

      const handleOnClick = (e) => {
        e.stopPropagation();

        const { target } = e;

        if (target?.dataset?.type) {
          const { type } = target.dataset;

          if (type === 'folder') {
            const isExpanded = target.getAttribute('aria-expanded') === 'true';

            target.setAttribute('aria-expanded', !isExpanded);

            target.firstElementChild.textContent = isExpanded ? 'folder' : 'folder_open';
          }

          if (type === 'file') {
            if (!this.#started) {
              runTest(target.dataset.name).then(() => {
                window.runner.onStarted(onStarted);

                window.runner.onCompleted(onCompleted);
              });
            } else {
              window.runner.abort();
            }
          }
        }
      };

      container.addEventListener('click', handleOnClick);

      header.addEventListener('mousedown', (e) => {
        const { target, currentTarget, button } = e;

        if (button !== 0) return;

        let prevX = e.clientX;
        let prevY = e.clientY;

        if (target !== currentTarget) return;

        const { offsetTop, offsetLeft } = this;

        header.style.cursor = 'grabbing';

        const handleMouseMove = (e) => {
          const { clientX, clientY } = e;

          const movementX = clientX - prevX;
          const movementY = clientY - prevY;

          this.style.top = `${offsetTop + movementY}px`;
          this.style.left = `${offsetLeft + movementX}px`;
        };

        document.addEventListener('mousemove', handleMouseMove);

        document.addEventListener(
          'mouseup',
          () => {
            header.style.cursor = null;
            document.removeEventListener('mousemove', handleMouseMove);
          },
          { once: true },
        );
      });

      append(shadowRoot, link, style, append(container, append(header, append(buttons, minButton)), content));
    }
  }

  get #content() {
    return this.shadowRoot.querySelector('.ui-file-explorer__content');
  }

  #createList(tests) {
    const list = document.createElement('ul');

    Object.entries(tests).forEach(([key, val]) => {
      const item = document.createElement('li');

      if (typeof val === 'string') {
        const button = createElement('span', { textContent: key });
        const icon = createElement('span', { className: 'material-symbols-outlined', textContent: 'description' });
        const container = createElement('div', { dataset: { type: 'file', name: val } });

        append(list, append(item, append(container, icon, button)));
      } else {
        const label = createElement('span', { textContent: key });
        const icon = createElement('span', { className: 'material-symbols-outlined', textContent: 'folder_open' });
        const container = createElement('div', { dataset: { type: 'folder', name: key }, ariaExpanded: true });

        append(list, append(item, append(container, icon, label)));

        append(item, this.#createList(val));
      }
    });

    return list;
  }
}

if (!customElements.get('ui-file-explorer')) customElements.define('ui-file-explorer', FileExplorer);
