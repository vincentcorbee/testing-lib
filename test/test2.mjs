import { describe, test, beforeAll, beforeEach, afterAll, afterEach } from '../dist/index.js';

// beforeAll(() => console.log('1 - beforeAll'));
// afterAll(() => console.log('1 - afterAll'));
// beforeEach(() => console.log('1 - beforeEach'));
// afterEach(() => console.log('1 - afterEach'));

// test('', () => console.log('1 - test'));

// describe('Scoped / Nested block', () => {
//   beforeAll(() => console.log('2 - beforeAll'));
//   afterAll(() => console.log('2 - afterAll'));
//   beforeEach(() => console.log('2 - beforeEach'));
//   afterEach(() => console.log('2 - afterEach'));

//   test('', () => console.log('2 - test'));
// });

describe('describe outer', () => {
  // console.log('describe outer-a');

  describe('describe inner 1', () => {
    // console.log('describe inner 1');

    test('test 1', () => {
      console.log('test 1');

      throw Error('foo');
    });
  });

  // console.log('describe outer-b');

  test('test 2', () => console.log('test 2'));

  describe('describe inner 2', () => {
    // console.log('describe inner 2');

    test('test 3', () => console.log('test 3'));
  });

  // console.log('describe outer-c');
});