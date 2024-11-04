import { loginUser } from '../login-user.js';
import { runTest } from '../run-test.js';

async function main() {
  const button = document.createElement('button');

  let started = false;

  const onStarted = () => {
    started = true;

    console.log('started');

    button.classList.add('started');

    button.textContent = 'Abort';
  };

  const onCompleted = () => {
    started = false;

    console.log('completed');

    button.classList.remove('started');

    button.disabled = false;
    button.textContent = 'Start';
  };

  const handleOnClick = () => {
    if (!started) {
      runTest('residency-information/happy-flow').then(() => {
        window.runner.onStarted(onStarted);

        window.runner.onCompleted(onCompleted);
      });
    } else {
      button.disabled = true;
      button.textContent = 'aborting';
      window.runner.abort();
    }
  };

  await loginUser('backstage');
  await loginUser('non_member');

  console.log('ready');

  const currentButton = document.getElementById('test-button');
  const currentStyleTag = document.getElementById('test-style');

  if (currentButton) currentButton.parentNode.removeChild(currentButton);
  if (currentStyleTag) currentStyleTag.parentNode.removeChild(currentStyleTag);

  const styleTag = document.createElement('style');

  window.runner = null;

  styleTag.id = 'test-style';
  styleTag.textContent = `
    #test-button {
      z-index: 9999;
      cursor: pointer;
      padding-left: 16px;
      padding-right: 16px;
      background-color: blue;
      height: 56px;
      border-radius: 8px;
      color: white;
      border:none;
      position: fixed;
      bottom: 16px;
      right: 16px
    }
    #test-button:disabled {
      background-color: grey;
      cursor: not-allowed;
    }

    #test-button.started {
      background-color: red;
    }
  `;

  document.head.appendChild(styleTag);

  button.id = 'test-button';
  button.textContent = 'Start';

  button.addEventListener('click', handleOnClick);

  document.body.appendChild(button);
}

main();
