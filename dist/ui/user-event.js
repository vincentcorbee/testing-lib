import { dispatchEvent, performAction } from './utils.js';
import { AssertionError } from '../core/assertion.js';
export const click = (selector) => dispatchEvent(selector, 'click');
export const blur = (selector) => dispatchEvent(selector, 'blur');
export const keyup = (selector, key) => dispatchEvent(selector, 'keyup', { key });
export function setInput(selectorOrElement, value) {
    return performAction(async (resolve) => {
        const element = typeof selectorOrElement === 'string'
            ? document.querySelector(selectorOrElement)
            : selectorOrElement;
        if (!element)
            throw new AssertionError({ name: 'setInput', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` });
        element.focus();
        /* To trigger event in React */
        const nativeInputValueSetter = Reflect.getOwnPropertyDescriptor(Reflect.getPrototypeOf(element), 'value')?.set;
        if (nativeInputValueSetter)
            nativeInputValueSetter.call(element, value);
        await dispatchEvent(element, 'change');
        await dispatchEvent(element, 'input');
        resolve();
    });
}
export function setInputFile(selectorOrElement, files) {
    return performAction(async (resolve) => {
        const element = typeof selectorOrElement === 'string'
            ? document.querySelector(selectorOrElement)
            : selectorOrElement;
        if (!element)
            throw new AssertionError({ name: 'setInputFile', expected: `Element with ${selectorOrElement}`, actual: element, pass: false, message: `${selectorOrElement} not found` });
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        element.files = dataTransfer.files;
        await dispatchEvent(element, 'change');
        resolve();
    });
}
export function setSelect(selectorOrElement, value) {
    return setInput(selectorOrElement, value);
}
//# sourceMappingURL=user-event.js.map