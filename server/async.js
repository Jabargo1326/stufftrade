// Express 4 doesn't catch errors thrown inside async routes by itself.
// Wrapping a route with wrap(...) sends those errors to our error handler instead of crashing.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
