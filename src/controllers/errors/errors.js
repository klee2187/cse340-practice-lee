const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

/**
 * Error Handling
 */
export const errorNotFound = (req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
};

// Global error handler
export const globalErrorHandler = (err, req, res, next) => {

    if (res.headersSent || res.finished) {
        return next(err);
    }

    const status = err.status || 500;

    console.error(`
        [${new Date().toISOString()}] ERROR:
        Status: ${status}
        Message: ${err.message}
        URL: ${req.originalUrl}
        Method: ${req.method}
        User Agent: ${req.headers['user-agent']}
        Stack: ${err.stack}
            `);

    const template = status === 404 ? '404' : '500';

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV 
    };

    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
    }
};