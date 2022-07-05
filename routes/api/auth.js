//handle getting json wen tokens for authetication
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//express validator
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route  type: GET request api/auth
//@desc   Test route
//@access Public
//whenever we want to use middle ware, we just added it in as the second parameter
router.get('/', auth, async(req, res) => {
    try {
        //req.user came from middleware/auth.jas req.user = decoded.user
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  type: POST api/auth
//@desc   Authenticate user & get token
//@access Public
router.post(
    '/', 
    [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
    ],
    async(req, res) => {
        //req.body can only work by initialize the middlewear for the body parser
        const errors = validationResult(req); 
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
    }

    //pull out some stuff from req.user body
    const {email, password} = req.body;  
    try {
    //See if user exists, if exist we send back a error
    // we don't want multiple emails
        let user = await User.findOne({ email });
        if(!user) {
            //so client can get the same type of error
            return res
                .status(400)
                .json({errors: [{ msg: 'Invalid credentials' }] });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({errors: [{ msg: 'Invalid Credentials'}]});
        }

        //get payload which includes the user id
        const payload = {
        user: {
            id: user.id //call back for user
        }
    }

    //sign the token where we pass in the payload and token
    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        //optional set of options
        { expiresIn: 360000 },
        //err and the call back sending in token
        (err, token) => {
            if(err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;