export declare const click: (selectorOrElement: string | HTMLElement) => Promise<unknown>;
export declare const blur: (selectorOrElement: string | HTMLElement) => Promise<unknown>;
export declare const keyup: (selectorOrElement: string | HTMLElement, key: string) => Promise<unknown>;
export declare function setInput(selectorOrElement: string | HTMLInputElement, value: any): Promise<unknown>;
export declare function setInputFile(selectorOrElement: any, files: any): Promise<unknown>;
export declare function setSelect(selectorOrElement: any, value: any): Promise<unknown>;
