import { Subject } from '../rx/index.js';
export type HistoryEvent = {
    url: string | null;
};
export declare const navigationSubject: Subject<HistoryEvent>;
