import { expect, screen, waitFor } from '@e2e/index.js';

export const getRegistrationIdFromPath = (pathname) => {
  const result = pathname.match(/^\/membership-registration(?=\/)(?:\/([^/]+)?)/);

  if (result === null) return null;

  return result[1] ?? null;
};
