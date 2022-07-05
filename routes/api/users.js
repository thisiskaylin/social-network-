//registering users and handeling users
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//express validator
const { check, validationResult } = require('express-validator');
//get the model .. means go up two levels to get model
const User = require('../../models/User');

//@route  type: POST api/users - POST REQUEST
//@desc   register user
//@access Public
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'please enter a password with 6 or more characters')
        .isLength({min: 6})
],
async(req, res) => {
//req.body can only work by initialize the middlewear for the body parser
    const errors = validationResult(req); 
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    //pull out some stuff from req.user body
    const {name, email, password} = req.body;  
    try {
    //See if user exists, if exist we send back a error
    // we don't want multiple emails
        let user = await User.findOne({ email });
        if(user) {
            //so client can get the same type of error
            return res
                .status(400)
                .json({errors: [{ msg: 'User already added' }] });
        }
    //get gravatar
    //pass the email to the method and that will get the url 
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm' //404 means not found
    })

    //cretate the user
    user = new User({
        name, 
        email,
        avatar,
        password
    });

    //encryt password
    const salt = await bcrypt.genSalt(10);
    //take this password and hashit
    user.password = await bcrypt.hash(password, salt);

    //save user in the database
    await user.save();//make a promise

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
        //err and the call back token
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

//we want to be able to send data to this route such
//as name, user, and password