const generateToken = (user) => {
  return `mock-jwt-for-user-${user._id.toString()}`;
};

module.exports = { generateToken };