/**
 *
 * @param {string} name
 * @param {Record<string, any> | null} [props]
 * @param {{ is?: string, ns?: string }} [options]
 * @returns
 */
function createElement(name, props, options) {
  const element = document.createElement(name);

  if (props) {
    Object.entries(props).forEach(([key, val]) => {
      if (key === 'dataset') {
        Object.entries(val).forEach(([k, v]) => (element.dataset[k] = v));
      } else if (key in element) {
        element[key] = val;
      } else {
        element.setAttribute(key, val);
      }
    });
  }

  return element;
}

/**
 *
 * @param {HTMLElement} parent
 * @param  {Node[]} children
 * @returns
 */
function append(parent, ...children) {
  children.forEach((child) => parent.appendChild(child));

  return parent;
}

function runTest(scenario) {
  const { promise, resolve } = Promise.withResolvers();
  const id = 'test';

  const currentScripTag = document.getElementById(id);

  if (currentScripTag) currentScripTag.parentNode.removeChild(currentScripTag);

  const scriptTag = document.createElement('script');

  scriptTag.id = id;
  scriptTag.type = 'module';
  scriptTag.src = `http://localhost:8000/${scenario}?t=${new Date().getTime()}`;

  scriptTag.addEventListener('load', resolve);

  document.head.appendChild(scriptTag);

  return promise;
}

const css = `
        .material-symbols-outlined {
          font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24
        }

        :host {
          --ui-file-explorer-folder-label-size: 12px;
          --ui-file-explorer-file-label-size: 12px;
          --ui-file-explorer-list-padding-left: 16px;
          --ui-file-explorer-content-padding: 16px;
          --ui-file-explorer-header-padding: 8px;
          --ui-file-explorer-shape: 5px;
          --ui-file-explorer-folder-icon-size: 18px;

          display: block;
          position: fixed;
          top: 8px;
          left: 8px;
          z-index: 9999;
          background-color: white;
          font-family: 'Roboto', sans-serif;
          color: hsl(336, 9%, 89%);
        }

        .ui-file-explorer__container {
          box-shadow: 1px 1px 5px 2px hsl(0, 0%, 0%, 0.2);
          border-radius: var(--ui-file-explorer-shape);
          background-color: hsl(300, 3%, 8%);
          overflow: hidden;
        }

        .ui-file-explorer__header {
          background-color: hsl(300, 3%, 13%);
          padding: var(--ui-file-explorer-header-padding);
        }

        .ui-file-explorer__content {
          padding: var(--ui-file-explorer-content-padding);
        }

        .ui-file-explorer__header button {
          background-color: hsl(30, 100%, 55%);
          border-radius: 100%;
          width: 12px;
          height: 12px;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
          display: block;
        }

        .ui-file-explorer__content > ul {
          padding-left: 0;
        }

        ul {
          padding-left: var(--ui-file-explorer-list-padding-left);
          list-style-type: none;
          margin-top: 0;
          margin-bottom:0;
        }

        li > div {
          display: flex;
          align-items: center;
        }

        li > div:first-child {
          cursor: pointer;
        }

        li > div:first-child > span:first-child {
          margin-right: 8px;
          pointer-events: none;
          font-size: var(--ui-file-explorer-folder-icon-size);
        }

        div[data-type="folder"] > span:nth-child(2) {
          font-size: var(--ui-file-explorer-folder-label-size);
          pointer-events: none;
        }

        div[data-type="folder"][aria-expanded="false"] + ul {
          display: none;
        }

        div[data-type="file"] > span:nth-child(2) {
          font-size: var(--ui-file-explorer-file-label-size);
          pointer-events: none;
        }
    `;

class FileExplorer extends HTMLElement {
  constructor() {
    super();
  }

  static observedAttributes = ['scenarios'];

  #started = false;

  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case 'scenarios':
        const scenarios = JSON.parse(newValue);

        this.#content.innerHTML = '';
        this.#content.appendChild(this.#createList(scenarios));
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
      const minButton = createElement('button', { className: 'ui-file-explorer__min-button' });
      const link = createElement('link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=folder_open',
      });

      const onStarted = () => {
        this.#started = true;

        console.log('started');
      };

      const onCompleted = () => {
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

      append(shadowRoot, link, style, append(container, append(header, minButton), content));
    }
  }

  get #content() {
    return this.shadowRoot.querySelector('.ui-file-explorer__content');
  }

  #createList(scenarios) {
    const list = document.createElement('ul');

    Object.entries(scenarios).forEach(([key, val]) => {
      const item = document.createElement('li');

      if (typeof val === 'string') {
        const button = createElement('span', { textContent: key });
        const icon = createElement('span', { className: 'material-symbols-outlined', textContent: 'play_arrow' });
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

async function main() {
  const response = await fetch(`http://localhost:8000/scenarios/scenarios.json?t=${new Date().getTime()}`);
  const scenarios = await response.json();

  console.log(scenarios);

  const currentIcons = document.getElementById('material-symsbols');

  if (currentIcons) currentIcons.parentNode.removeChild(currentIcons);

  const link = createElement('link', {
    id: 'material-symbols',
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  });

  append(document.head, link);

  const currentFileExplorerEl = document.querySelector('ui-file-explorer');

  if (currentFileExplorerEl) currentFileExplorerEl.parentNode.removeChild(currentFileExplorerEl);

  const fileExplorerEl = document.createElement('ui-file-explorer');

  append(document.body, fileExplorerEl);

  fileExplorerEl.setAttribute('scenarios', JSON.stringify(scenarios));
}

main();
