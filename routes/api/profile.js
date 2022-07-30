const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route  type: GET request api/profile/me
//@desc   Get current users profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        //this user here is gona pretian to the moder /users
        const profile = await Profile.findOne({ user: req.user.id}).populate('user',['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send()
    }
});

//@route POST api/profile
//desc Create or update user profile
//@access Private
router.post('/', 
[
    auth, 
    [
        check('status', 'Status is required')
            .not()
            .isEmpty(),
        check('skills', 'Skills is required')
            .not()
            .isEmpty()
    ]
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

   // destructure the request
   const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
  } = req.body;

  //Build profile object to insert into data base and check if those are coming in
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill=> skill.trim());
  }

  //Build social object
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (facebook) profileFields.social.facebook = facebook;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;

  
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    //look for a file by the user
    if(profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
            { user : req.user.id },
            { $set: profileFields },
            { new: true}
        );
        //if there is a profile return entire profile
        return res.json(profile);
    }
    //If the profile is not found we are going to create the profile and save it 
    profile = new Profile(profileFields);

    await profile.save();
    res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
);


//@route GET request from api/profile
//desc GET all profile
//@access Public
router.get('/', async (req, res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET request from api/profile/user/:user_id
//desc GET all profile by user ID
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try{
        const profile = await Profile.findOne({ 
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        
        if (!profile) 
            return res.status(400).json({ msg: 'Profile not found'});

        res.json(profile);
    } catch(err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

//@route DELETE request api/profile
//desc DELETE profile, user&
//@access Public
router.delete('/', auth, async (req, res) => {
    try{
        //remove users posts
        await Post.deleteMany({ user: req.user.id });
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted'});
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT request api/profile/experience (because we are updating a profile)
//desc PUT profile, user&
//@access Public
router.put(
    '/experience', 
    [
        auth, 
        [
        check('title', 'Title is required')
            .not()
            .isEmpty(),
        check('company', 'Company is required')
            .not()
            .isEmpty(),
        check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //get the body data, the data that is coming in
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        } = req.body;
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //unshift pushes everything to end so the most recent goes first
            profile.experience.unshift(newExp);
            await profile.save(); 
            res.json(profile);
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route DELETE request api/profile/experience/:exp_id
//desc DELETE experience from profile
//@access Private
router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        //take the profile we have and splice to take it out
        profile.experience.splice(removeIndex, 1);
        //resave it
        await profile.save();
        //send back to our response
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT request api/profile/education (because we are updating a profile)
//desc PUT profile education
//@access Private
router.put(
    '/education', 
    [
        //fields
        auth, 
        [
        check('school', 'School is required')
            .not()
            .isEmpty(),
        check('degree', 'Degree is required')
            .not()
            .isEmpty(),
        check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
        check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //get the body data, the data that is coming in
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //unshift pushes everything to end so the most recent goes first
            profile.education.unshift(newEdu);
            await profile.save(); 
            res.json(profile);
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route DELETE request api/profile/education/:exp_id
//desc DELETE experience from profile
//@access Private
router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);
        //take the profile we have and splice to take it out
        profile.education.splice(removeIndex, 1);
        //resave it
        await profile.save();
        //send back to our response
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET request api/profile/github/:username
//desc GET user repos from Github
//@access Private
router.get('/github/:username', async(req, res) => {
    try {
        const uri = encodeURI(
            `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc`
        );
        const headers = {
            'user-agent': 'node.js',
            Authorization: `token ${config.get('githubToken')}`
        };
        const gitHubResponse = await axios.get(uri, { headers });
        return res.json(gitHubResponse.data);
    } catch(err) {
        console.error(err.message);
        return res.status(404).json({ msg: 'No Github profile found'});
    }
});

module.exports = router;