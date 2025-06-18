const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error('Controller error:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    });
};

export { catchAsync };
