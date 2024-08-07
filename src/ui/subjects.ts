import { Subject } from '../rx/index.js';

export type HistoryEvent = {
  url: string | null;
};

export const navigationSubject = new Subject<HistoryEvent>();
