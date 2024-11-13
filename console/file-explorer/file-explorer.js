import { runTest } from '../run-test.js';
import { append, createElement } from '../utils/index.js';
import { css } from './file-explorer.css.js';
import { HTMLReporter } from 'http://localhost:8000/dist/reporters/index.js';

class FileExplorer extends HTMLElement {
  constructor() {
    super();
  }

  static observedAttributes = ['tests'];

  #status = 'idle';
  #test = '';

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
      const container = createElement('div', { className: 'ui-file-explorer__container', dataset: { status: 'idle' } });
      const content = createElement('div', { className: 'ui-file-explorer__content' });
      const header = createElement('div', { className: 'ui-file-explorer__header' });
      const headerTitle = createElement('span', {
        className: 'ui-file-explorer__header-title',
        textContent: 'e2e tests',
      });
      const buttons = createElement('div', { className: 'ui-file-explorer__buttons' });
      const minButton = createElement('button', { className: 'ui-file-explorer__min-button' });
      const link = createElement('link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=folder_open',
      });

      const onBegin = (suite) => {
        const item = this.#tree.querySelector(`[data-name="${this.#test}"]`);

        this.#status = 'started';
        this.#container.dataset.status = 'started';

        item.dataset.running = true;
        item.firstElementChild.textContent = 'stop';
      };

      const onEnd = (result) => {
        const item = this.#tree.querySelector(`[data-name="${this.#test}"]`);
        const reporter = new HTMLReporter({
          onEnd: (report) => {
            /* Append report to the DOM */
            const fragment = document.createDocumentFragment();
            const template = document.createElement('template');

            template.innerHTML = report;
            fragment.appendChild(template.content);

            const reportScript = fragment.querySelector('script');

            reportScript.remove();

            const script = document.createElement('script');

            script.textContent = reportScript.textContent;

            const closeButton = createElement('button', {
              textContent: 'Sluiten',
              style: `border: 0; margin-left: auto; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;`,
            });

            const dialog = createElement(
              'dialog',
              {
                style: `
              border: none;
              padding: 0;
              border-radius: 16px;
            `,
              },
              [createElement('div', { style: `padding: 16px;` }, [closeButton]), fragment, script],
            );

            closeButton.addEventListener('click', () => {
              dialog.close();
              dialog.remove();
            });

            document.body.appendChild(dialog);

            dialog.showModal();
          },
        });
        reporter.onEnd(result);

        this.#status = 'idle';
        this.#test = '';
        this.#container.dataset.status = 'idle';

        item.dataset.running = false;
        item.firstElementChild.textContent = 'description';
      };

      const handleOnClick = async (e) => {
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
            if (this.#status === 'idle') {
              this.#test = target.dataset.name;
              this.#status = 'pending';
              this.#container.dataset.status = 'pending';

              await runTest(target.dataset.name);

              window.runner.onBegin(onBegin);
              window.runner.onEnd(onEnd);
            } else if (this.#status === 'started') {
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

      append(
        shadowRoot,
        link,
        style,
        append(container, append(header, append(buttons, minButton), headerTitle), content),
      );
    }
  }

  get #content() {
    return this.shadowRoot.querySelector('.ui-file-explorer__content');
  }

  get #container() {
    return this.shadowRoot.querySelector('.ui-file-explorer__container');
  }

  get #tree() {
    return this.shadowRoot.querySelector('.ui-file-explorer__content > ul');
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
