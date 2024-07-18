export declare function fireEvent(selectorOrElement: string | Element, eventType: string, payload?: {}): Promise<unknown>;
export declare const click: (selectorOrElement: string | Element) => Promise<unknown>;
export declare const blur: (selectorOrElement: string | Element) => Promise<unknown>;
export declare const keyup: (selectorOrElement: string | Element, key: string) => Promise<unknown>;
export declare function setInput<E extends HTMLInputElement | HTMLSelectElement>(selectorOrElement: string | E, value: any): Promise<unknown>;
export declare function setInputFile(selectorOrElement: string | HTMLInputElement, ...files: File[]): Promise<unknown>;
export declare function setSelect(selectorOrElement: HTMLSelectElement | string, value: any): Promise<unknown>;
