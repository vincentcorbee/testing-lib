import { describe, test, expect, beforeAll } from './dist/index.js'

beforeAll(() => {
  console.log('beforeAll')
})

describe('outer first', () => {
  test('should resolve to lemon', async () => {
    await expect(Promise.resolve('lemon')).resolves.toEqual('lemon')
  })

  test('should be true', async () => {
    expect(true).toEqual(false)
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