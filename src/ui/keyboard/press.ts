import { waitForWithResolvers } from '../../shared/wait-for-with-resolvers.js';
import { wait } from '../../shared/wait.js';
import { fireEvent } from '../event/fire-event.js';
import { getCode } from '../get-code.js';

const keyMap = {
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  Space: ' ',
  ControlLeft: 'Control',
  ControlRight: 'Control',
  Control: 'Control',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  AltLeft: 'Alt',
  AltRight: 'Alt',
};

const getKeyCode = (value: string): string => {
  return keyMap[value] || getCode(value);
};

const getKeyAndModifiers = (
  value: string,
): { modifiers: { key: string; code: string }[]; key: string; code: string } => {
  const parts = value === '+' ? [value] : value.split('+');

  if (parts.length > 1) {
    const key = parts.pop()!;
    const code = getKeyCode(key);
    const modifiers = parts.flatMap((code) => {
      const key = keyMap[value];

      return key ? [{ key, code }] : [];
    });

    return { modifiers, key, code };
  }

  const key = parts.pop()!;
  const code = getKeyCode(key);

  return { modifiers: [], key, code };
};

export function press(value: string, options: { delay?: number; target?: string | Element | Window } = {}) {
  const { delay = 0, target = window } = options;

  return waitForWithResolvers(async (resolve, reject) => {
    if (value && value.length > 0) {
      try {
        const { modifiers, key, code } = getKeyAndModifiers(value);

        for (const { key, code } of modifiers) {
          await fireEvent(target, 'keydown', { key, code });
        }

        await fireEvent(target, 'keydown', { key, code });

        if (delay) await wait(delay);

        for (const { key, code } of modifiers) {
          await fireEvent(target, 'keyup', { key, code });
        }

        await fireEvent(target, 'keyup', { key, code });

        resolve();
      } catch (error) {
        reject(error);
      }
    } else {
      resolve();
    }
  });
}
