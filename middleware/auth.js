const jwt = require('jsonwebtoken');
const config = require('config');

//has access to request and response objects
module.exports = function(req, res, next) {
    //Get token from header - when we sent request we need to sent it with header
    const token = req.header('x-auth-token'); //send in xauthtoken

    //check if no token
    if (!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //verify token 
    try {
        //token = token sent by header
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        //sent value to user for the user that is used in the decoded token
        req.user = decoded.user; //req.user can be used in any of the correct routes
        next();
    } catch(err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}