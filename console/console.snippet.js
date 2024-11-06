const id = 'e2e-testing';

const currentScripTag = document.getElementById(id);

if (currentScripTag) currentScripTag.parentNode.removeChild(currentScripTag);

const scriptTag = document.createElement('script');

scriptTag.id = id;
scriptTag.type = 'module';
scriptTag.src = `http://localhost:8000/console/index.js?t=${new Date().getTime()}`;

document.head.appendChild(scriptTag);
