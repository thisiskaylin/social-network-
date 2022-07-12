const express = require('express');
const router = express.Router();
const { check, validationResult} = require('express-validator'); //error checker
const auth = require('../../middleware/auth'); //auth middleware, 2 levels up 

//in order to get the name profile and avatar we need to import model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  type: POST api/posts
//@desc   Create a post
//@access Private
router.post('/', 
    [
        auth, 
        [
        check('text', 'Text is required')
            .not()
            .isEmpty()
        ] 
    ],
    async(req, res) => { //body
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
            });

            const post = await newPost.save();
            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route  type: GET api/posts
//@desc   GET all posts
//@access Private
router.get('/', auth, async (req, res) => {
    try {
        //-1 search gthe most recent first
        const posts = await Post.find().sort({ date: -1 }); 
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  type: GET api/posts/:id
//@desc   GET post by ID
//@access Private
router.get('/:id', auth, async (req, res) => {
    try {
        //req.params.id to get from the url 
        const post = await Post.findById(req.params.id); 
        //check if there is a post with that id
        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        //if its not a valid user then make proper reponse
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

//@route  type: DELETE api/posts/:id
//@desc   DELETE a post
//@access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        //-1 search gthe most recent first
        const post = await Post.findById(req.params.id); 

        if(!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        //check on user
        if(post.user.toString() !== req.user.id) { 
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

//@route  type: PUT api/posts/like/:id
//@desc   Like a post
//@access Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        //fetch the post
        const post = await Post.findById(req.params.id);
        //check if the post has already been liked by this user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  type: PUT api/posts/unlike/:id
//@desc   unLike a post
//@access Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        //fetch the post
        const post = await Post.findById(req.params.id);
        //check if the post has already been liked by this user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        //Get the remove index
        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIndex, 1),

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  type: POST api/posts/comment/:id
//@desc   Comment on a post
//@access Private
router.post('/comment/:id', 
    [
        auth, 
        [
        check('text', 'Text is required')
            .not()
            .isEmpty()
        ] 
    ],
    async(req, res) => { //body
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id); //give us the new post

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments); //return type comments

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route  type: DELETE api/posts/comment/:id/:comment_id
//@desc   Delete comment
//@access Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); 
        //pull out comment from post
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );

        //Make sure comment exist
        if(!comment){
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        //make sure the user who delete the comment is the user who make the comment
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'User not authorized' });
        }

        //find index
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1),

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;