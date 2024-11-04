export function runTest(scenario) {
  const { promise, resolve } = Promise.withResolvers();
  const id = 'test';

  const currentScripTag = document.getElementById(id);

  if (currentScripTag) currentScripTag.parentNode.removeChild(currentScripTag);

  const scriptTag = document.createElement('script');

  scriptTag.id = id;
  scriptTag.type = 'module';
  scriptTag.src = `http://localhost:8000/scenarios/${scenario}.spec.js?t=${new Date().getTime()}`;

  scriptTag.addEventListener('load', resolve);

  document.head.appendChild(scriptTag);

  return promise;
}
