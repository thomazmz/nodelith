import { RepositoryError } from './repository-error'

describe('RepositoryError', () => {
  it('should be instance of RepositoryError', () => {
    expect(() => {
      throw new RepositoryError('Custom Repository Error Message')
    }).toThrow(RepositoryError)
  })

  it('should have name equal to "RepositoryError"', () => {
    try {
      throw new RepositoryError('Custom Repository Error Message')
    } catch (error) {
      expect(error.name).toBe('RepositoryError');
    }
  })

  it('should include error message when one is passed', () => {
    expect(() => {
      throw new RepositoryError('Custom Repository Error Message')
    }).toThrow('Custom Repository Error Message')
  })
})