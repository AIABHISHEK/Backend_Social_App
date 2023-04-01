const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Invalid authorization header');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'abhishek');
    } catch (error) {
        console.log(error);
        error.statusCode = 500;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    console.log(decodedToken);
    req.userId = decodedToken.userId;
    next();
}