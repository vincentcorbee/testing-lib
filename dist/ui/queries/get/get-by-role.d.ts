export type GetByRoleOptions = {
    container?: Node;
    index?: number;
    timeout?: number;
    name?: string;
    exact?: boolean;
    label?: string;
    disabled?: boolean;
    level?: number;
};
export type Role = 'button' | 'heading' | 'checkbox' | 'radio';
export declare function getByRole<E extends Element>(role: Role, options?: {
    container?: Node;
    index?: number;
    timeout?: number;
    name?: string;
    exact?: boolean;
    label?: string;
    disabled?: boolean;
    level?: number;
}): Promise<E>;
