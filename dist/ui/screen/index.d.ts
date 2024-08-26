import * as queries from '../queries/index.js';
import { isVisible } from './is-visible.js';
export declare const screen: {
    isVisible: typeof isVisible;
    findByText<E extends Element>(text: string, options?: string | {
        parent?: string;
        container?: Node;
        index?: number;
        timeout?: number;
    }): Promise<E | null>;
    getBySelector<E extends Element = Element>(selector: string, options?: {
        container?: Document | HTMLElement;
        timeout?: number;
    }): Promise<E>;
    getByText<E extends Element>(text: string, options?: string | {
        parent?: string;
        container?: Node;
        index?: number;
        timeout?: number;
        exact?: boolean;
    }): Promise<E>;
    getAllByText<E extends Element = Element>(text: string, options?: string | {
        parent?: string;
        container?: Node;
        timeout?: number;
        exact?: boolean;
    }): Promise<E[]>;
    getByLabel(text: string, options?: {
        container?: Node;
        timeout?: number;
    }): Promise<HTMLInputElement>;
    getByTestId<E extends Element>(id: string, options: {
        container?: Document | HTMLElement;
        timeout?: number;
    }): Promise<E>;
    getByRole<E extends Element>(role: queries.Role, options?: {
        container?: Node;
        index?: number;
        timeout?: number;
        name?: string;
        exact?: boolean;
        label?: string;
        disabled?: boolean;
        level?: number;
    }): Promise<E>;
    getByPlaceholder<E extends Element>(placeholder: string, options: {
        container?: Document | HTMLElement;
        timeout?: number;
    }): Promise<E>;
    getByXpath<E extends Element>(expression: string, options?: {
        container?: Node;
        index?: number;
        timeout?: number;
        name?: string;
    }): Promise<E>;
};
