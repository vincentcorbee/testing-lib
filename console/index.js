import './file-explorer/file-explorer.js';
import { createElement, append } from './utils/index.js';

async function main() {
  const response = await fetch(`http://localhost:8000/console/tests.json?t=${new Date().getTime()}`);
  const tests = await response.json();

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
  const style = createElement('style', {
    textContent: `
    body {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-end;

      > main {
        flex: 1;
      }
    }

    #root {
      min-width: 0;
      flex: 3;
    }
    `,
  });

  append(document.head, style);
  append(document.body, fileExplorerEl);

  fileExplorerEl.setAttribute('tests', JSON.stringify(tests));
}

main();
