import { describe, test, expect, beforeAll, beforeEach, runner, request } from './dist/index.js'

const fn = runner.mockFunction((a, b) => a + b)

runner.intercept(globalThis, 'fetch', async function (originalFetch, ...args) {
  console.log(args)

  const response = await originalFetch.call(this, ...args);

  return response;
})

fetch('https://jsonplaceholder.typicode.com/todos/1', { method: 'GET', headers: { 'x-foo': 'bar' } }).then()

// const req = new XMLHttpRequest()

// req.open('GET', 'https://jsonplaceholder.typicode.com/todos/1')

fn(1, 2)

let msg = ''

beforeAll(() => {
  msg = 'doei'
})

beforeEach(() => {
  msg = 'hello'
})


  describe('outer first', () => {
    test('should resolve to lemon', async () => {
      await expect(Promise.resolve('lemon')).resolves.toEqual('lemon')
      expect(msg).toEqual('hello')

      msg = 'doei'
    })

    test('should be true', async () => {
      expect(true).toEqual(true)
      // expect({ foo: 'bar' }).toEqual({ foo: 'baz' })
    })

    describe('inner first', () => {
      test('should be one', () => {
          expect(1).toEqual(1)
      })
      test('should be 2', () => {
          expect(1).toEqual(1)
      })
      test('should be 3', () => {
          expect(1).toEqual(1)
      })
    })

    test('should be in outer firest', () => {
      expect(1).toEqual(1)
    })
  })

  describe('outer second', () => {
    test('should resolve to lemon', async () => {
      await expect(Promise.resolve('lemon')).resolves.toEqual('lemon')
    })

    describe('inner second', () => {
      test('should be in inner second', () => {
        expect(1).toEqual(1)
      })
    })

    test('should be in outer second', () => {
      expect(1).toEqual(1)
    })
  })

  describe('outer third', () => {
    test('should resolve to 1', async () => {
      await expect(Promise.resolve(2)).resolves.toEqual(2)
    })

    describe('inner third', () => {
      test('should be 2', () => {
        expect(1).toEqual(1)
      })

      describe('inner inner third', () => {
        test('should be 3', () => {
          expect(1).toEqual(1)
        })

        describe('inner inner inner third', () => {
          test('should be 4', () => {
            expect(1).toEqual(1)
          })
        })

        test('should be in inner inner third', () => {
          expect(1).toEqual(1)
        })
      })

      test('should be in inner third', () => {
        expect(1).toEqual(1)
      })
    })

    test('should be in outer first', () => {
      expect(1).toEqual(1)
    })
  })
