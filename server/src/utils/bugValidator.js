function validateBug(data) {
  const errors = {};

  // Check if title exists
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  }

  // Check if description exists
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }

  // Validate status field
  const validStatuses = ['open', 'in-progress', 'resolved'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.status = 'Invalid status';
  }

  // Return validation result
  return {
    isValid: Object.keys(errors).length === 0, // true if no errors
    errors
  };
}

module.exports = { validateBug };
