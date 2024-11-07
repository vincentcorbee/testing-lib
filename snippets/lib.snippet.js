/*
  This script injects the e2e testing library into the current page.
*/

const id = 'e2e-testing-lib';

const currentScripTag = document.getElementById(id);

if (currentScripTag) currentScripTag.parentNode.removeChild(currentScripTag);

const scriptTag = document.createElement('script');

scriptTag.id = id;
scriptTag.type = 'module';
scriptTag.innerHTML = `
import * as e2e from 'http://localhost:8000/index.js'
window.e2e = e2e;`;

document.head.appendChild(scriptTag);
