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
        // decode valid token
        jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
          if (error) {
            return res.status(401).json({ msg: 'Token is not valid' });
          } else {
            // can use this user in any other route
            req.user = decoded.user;
            next();
          }
        });
      } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
      }
}