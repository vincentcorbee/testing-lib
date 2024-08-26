import { navigationFactory } from './navigation/navigation-factory.js';

export * from './screen/index.js';
export * as event from './event/index.js';
export * as request from './request/index.js';
export * as user from './user/index.js';
export * as queries from './queries/index.js';
export * as page from './page/index.js';
export { waitFor } from '../shared/wait-for.js';

export const navigation = navigationFactory(globalThis.__navigation__);
