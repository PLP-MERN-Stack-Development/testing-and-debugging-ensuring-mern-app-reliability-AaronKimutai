const requireApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-KEY');
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access Denied: API Key required.' 
    });
  }

  
  const VALID_API_KEY = 'super-secret-bug-key-123'; 

  if (apiKey !== VALID_API_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Invalid API Key.' 
    });
  }

  
  next();
};

module.exports = requireApiKey;