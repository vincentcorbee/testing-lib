import { describe, test, expect, beforeAll, beforeEach, runner, request } from '../dist/index.js';

const fn = runner.mockFunction((a, b) => a + b);

runner.intercept(globalThis, 'fetch', async function (originalFetch, ...args) {
  console.log(args);

  const response = await originalFetch.call(this, ...args);

  return response;
});

// fetch('https://jsonplaceholder.typicode.com/todos/1', { method: 'GET', headers: { 'x-foo': 'bar' } }).then()

// const req = new XMLHttpRequest()

// req.open('GET', 'https://jsonplaceholder.typicode.com/todos/1')

fn(1, 2);

let msg = '';

beforeAll(() => {
  msg = 'doei';

  console.log('beforeAll');
});

beforeEach(() => {
  msg = 'hello';

  console.log('beforeEach');
});

// describe('outer first', () => {
//   test.skip('should resolve to lemon', async () => {
//     expect(msg).toEqual('hello')

//     msg = 'doei'
//   })

//   test.skip('should be true', async () => {
//     expect(true).toEqual(true)
//     // expect({ foo: 'bar' }).toEqual({ foo: 'baz' })
//   })

//   describe('inner first', () => {
//     test.skip('should be one', () => {
//         expect(1).toEqual(1)
//     })
//     test.skip('should be 2', () => {
//         expect(1).toEqual(1)
//     })
//     test.skip('should be 3', () => {
//         expect(1).toEqual(1)
//     })
//   })

//   test.skip('should be in outer first', () => {
//     expect(1).toEqual(1)
//   })

//   describe('inner second', () => {
//     test('foo', async () => {
//       const p = new Promise((resolve) => {
//         setTimeout(() => { resolve('lemo') }, 5000)
//       })
//       await expect(p.then()).resolves.toEqual('lemon')
//     })
//   })

//   test('should be in outer first as last test', () => {
//     expect(1).toEqual(1)
//   })
// })

// describe('outer first', () => {
//   beforeEach(() => {
//     console.log('beforeEach outer first');
//   });
//   test.only('first test', () => {
//     expect(true).toEqual(true);
//     expect(msg).toEqual('hello');
//   });

//   test.only('second test', () => {
//     // expect(true).not.toEqual(true);
//     // throw Error('error');
//   });

//   describe('inner first', () => {
//     test.only('inner first test', () => {
//       expect(1).toEqual(1);
//     });

//     test.only('inner second test', () => {
//       expect(2).toEqual(2);
//     });
//   });
// });

// describe('outer second', () => {
//   test.skip('should resolve to lemon', async () => {
//     await expect(Promise.resolve('lemon')).resolves.toEqual('lemon')
//   })

//   describe('inner second', () => {
//     test.skip('should be in inner second', () => {
//       expect(1).toEqual(1)
//     })
//   })

//   test.skip('should be in outer second', () => {
//     expect(1).toEqual(1)
//   })
// })

// describe('outer third', () => {
//   test.skip('should resolve to 1', async () => {
//     await expect(Promise.resolve(2)).resolves.toEqual(2)
//   })

//   describe('inner third', () => {
//     test.skip('should be 2', () => {
//       expect(1).toEqual(1)
//     })

//     describe('inner inner third', () => {
//       test.skip('should be 3', () => {
//         expect(1).toEqual(1)
//       })

//       describe('inner inner inner third', () => {
//         test.skip('should be 4', () => {
//           expect(1).toEqual(1)
//         })
//       })

//       test.skip('should be in inner inner third', () => {
//         expect(1).toEqual(1)
//       })
//     })

//     test.skip('should be in inner third', () => {
//       expect(1).toEqual(1)
//     })
//   })

//   test.skip('should be in outer first', () => {
//     expect(1).toEqual(1)
//   })
// })
