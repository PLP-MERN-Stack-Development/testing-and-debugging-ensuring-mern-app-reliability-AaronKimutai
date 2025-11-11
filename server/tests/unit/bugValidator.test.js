const { validateBug } = require('../../src/utils/bugValidator');

describe('Bug Validator Unit Tests', () => {
  describe('Title Validation', () => {
    it('should return an error if title is missing', () => {
      const data = { description: 'A valid description', status: 'open' };
      const { isValid, errors } = validateBug(data);
      expect(isValid).toBe(false);
      expect(errors.title).toBe('Title is required');
    });
  });

  describe('Description Validation', () => {
    it('should return an error if description is missing', () => {
      const data = { title: 'A valid title', status: 'open' };
      const { isValid, errors } = validateBug(data);
      expect(isValid).toBe(false);
      expect(errors.description).toBe('Description is required');
    });
  });

  describe('Status Validation', () => {
    it('should return an error for an invalid status', () => {
      const data = { title: 'Valid title', description: 'Valid description', status: 'invalid' };
      const { isValid, errors } = validateBug(data);
      expect(isValid).toBe(false);
      expect(errors.status).toBe('Invalid status');
    });

    it('should pass with a valid status', () => {
      const data = { title: 'Valid title', description: 'Valid description', status: 'open' };
      const { isValid } = validateBug(data);
      expect(isValid).toBe(true);
    });
  });
});
