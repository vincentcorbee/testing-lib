import { describe, test, expect, beforeAll, beforeEach, runner } from './dist/index.js'

const fn = runner.mockFunction((a, b) => a + b)

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
    expect(msg).toEqual('hello')
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
})

describe('outer second', () => {
  test('should resolve to lemon', async () => {
    await expect(Promise.resolve('lemon')).resolves.toEqual('lemon')
  })

  describe('inner second', () => {
    test('should be one', () => {
      expect(1).toEqual(1)
    })
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
    })
  })
})