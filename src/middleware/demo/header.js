/**
 * Middleware to add custom headers for demo purposes.
 */
export const addDemoHeaders = (req, res, next) => {
    res.setHeader('X-Demo-Page', 'true');
    res.setHeader('X-Middleware-Demo', 'This is a middleware demo header');
    next();
};