const requireApiKey = require('../../middleware/authMiddleware');



describe('Auth Middleware Unit Tests', () => {
  // mock objects used for every test
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
    };
    
    
    mockRes = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis(),
    };
    
 
    mockNext = jest.fn();
  });

  const VALID_KEY = 'super-secret-bug-key-123';

  // test valid API Key
  test('should call next() if a valid API key is provided', () => {
    mockReq.header.mockReturnValue(VALID_KEY);
    requireApiKey(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  // test missing API Key
  test('should return 401 and not call next() if no API key is provided', () => {
    mockReq.header.mockReturnValue(null);

    requireApiKey(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Access Denied: API Key required.' })
    );
  });

  // Test invalid API Key
  test('should return 403 and not call next() if an invalid API key is provided', () => {
    mockReq.header.mockReturnValue('wrong-key');
    requireApiKey(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Access Denied: Invalid API Key.' })
    );
  });
});

