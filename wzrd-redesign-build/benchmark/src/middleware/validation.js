export function validationMiddleware(req, res, next) {
  const errors = [];
  
  if (req.path === '/api/tasks' && req.method === 'POST') {
    if (!req.body.title || typeof req.body.title !== 'string') {
      errors.push('title is required and must be a string');
    }
    if (req.body.title && req.body.title.length > 200) {
      errors.push('title must be less than 200 characters');
    }
    if (req.body.priority && !['low', 'medium', 'high'].includes(req.body.priority)) {
      errors.push('priority must be low, medium, or high');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
}
