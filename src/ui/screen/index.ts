import * as queries from '../queries/index.js';
import { isVisible } from './is-visible.js';

export const screen = {
  ...queries,
  isVisible,
};
