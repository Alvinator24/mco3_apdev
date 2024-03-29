const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')
const multer = require('multer')

const User = require('../models/users')
const Post = require('../models/post')
const Comment = require('../models/comment')

// image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

// new user (displaying the form)
router.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register Page'
    })
})

// register new user
router.post('/register', [
    check('username')
        .notEmpty()
        .withMessage('Username cannot be empty')
        .isLength({ min: 5 })
        .withMessage('Username must at least be 5 characters'),
    check('password')
        .notEmpty()
        .withMessage('Password cannot be empty'),
    check('lastname')
        .notEmpty()
        .withMessage('Lastname cannot be empty'),
    check('firstname')
        .notEmpty()
        .withMessage('Firstname cannot be empty'),
    check('email')
        .isEmail()
        .withMessage('Enter a valid email'),
    check('mobilenumber')
        .isNumeric()
        .withMessage('Has to be a valid mobile number')
        .isLength({ min: 11, max: 11 })
        .withMessage('Mobile number has to be 11 digits'),
    check('bio')
        .isLength({ max: 30 })
        .withMessage('Bio has a maximum of 30 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            res.send('Username is already taken!')
        } else if (req.body.password != req.body.confirmpassword) {
            res.send('Reconfirm password!')
        } else {
            const newUser = new User({
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                email: req.body.email,
                mobilenumber: req.body.mobilenumber,
                username: req.body.username,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                bio: req.body.bio,
                agree: req.body.agree
            });
            await newUser.save();
        }
        res.redirect('/');
    } catch (error) {
        res.render('Error creating new user')
    }
});

// get the login page
router.get('/login', (req, res) => {
    res.render('users/login', {
        title: 'Login Page'
    })
})

// login authentication
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
      const findUser = await User.findOne({ username })
      if (!findUser) {
        console.log('User does not exist!')
        return res.redirect('./login')
      }
      const match = await bcrypt.compare(password, findUser.password)
      if (!match) {
        console.log('Invalid password')
        return res.redirect('./login')
      } else {
        req.session.username = username
        return res.redirect('./homepage')
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' });
    }
});

// get settings page
router.get('/settings/:id', async (req, res) => {
    const findUser = await User.findOne({ username: req.session.username })
    try {
        res.render('users/settings', {
            title: 'Settings Page',
            findUser
        })
    } catch (error) {
        console.error('Error fetching user settings:', error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// delete user
router.delete('/settings/:id', async (req, res) => {
    const findUser = await User.findOne({ username: req.session.username })
    try {
        await User.findOneAndDelete(findUser)
        res.redirect('/')
    } catch (error) {
        console.error('Error fetching user settings:', error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// edit settings page
router.put('/settings/:id', upload.single('image'), async (req, res) => {
    try {
        const userId = req.params.id;
        const updateFields = {};

        if (req.body.lastname) {
            updateFields.lastname = req.body.lastname;
        }
        if (req.body.firstname) {
            updateFields.firstname = req.body.firstname;
        }
        if (req.body.username) {
            updateFields.username = req.body.username;
        }
        if (req.body.email) {
            updateFields.email = req.body.email;
        }
        if (req.body.mobilenumber) {
            updateFields.mobilenumber = req.body.mobilenumber;
        }
        if (req.body.bio) {
            updateFields.bio = req.body.bio;
        }
        if (req.body.password) {
            updateFields.password = req.body.password;
        }
        if (req.file && req.file.filename) {
            updateFields.image = req.file.filename;
        }

        await User.findByIdAndUpdate(userId, updateFields);

        res.redirect('../homepage');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// homepage not logged in
router.get('/notloggedinhomepage', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/notloggedinhomepage', {
            title: 'Home Page',
            posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// homepage logged in
router.get('/homepage', async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const findUser = await User.findOne({ username: req.session.username });
        if (!findUser || !findUser._id) {
            return res.redirect('/');
        }
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('users/homepage', {
            title: 'Home Page',
            posts,
            searchQuery,
            findUser
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    })
});

router.get('/mostpopular', async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const findUser = await User.findOne({ username: req.session.username });
        if (!findUser || !findUser._id) {
            return res.redirect('/');
        }
        let posts;
        if (searchQuery) {
            posts = await Post.find({ title: { $regex: searchQuery, $options: 'i' } }).sort({ upvotes: -1 });
        } else {
            posts = await Post.find().sort({ upvotes: -1 });
        }
        res.render('users/homepage', {
            title: 'Home Page',
            posts: posts,
            searchQuery,
            findUser
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// view posts
router.get('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const comments = await Comment.find().sort({ createdAt: -1 });
        const postComments = comments.filter(comment => String(comment.post) === postId);
        res.render('users/posts', {
            title: 'View Post',
            post,
            comments: postComments
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// post comment
router.post('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { comment } = req.body;
        // Create a new comment and associate it with the post
        const newComment = new Comment({
            body: comment,
            post: postId,
            author: req.session.username
        });
        await newComment.save();
        res.redirect('../homepage');
    } catch (error) {
        res.status(500).send('New comment not published: ' + error.message);
    }
})

// publish post
router.post('/homepage', async (req, res) => {
    try {
        const { post_title, post_body, community } = req.body
        const newPost = new Post({
            title: post_title,
            body: post_body,
            community,
            author: req.session.username
        })
        await newPost.save()
        res.redirect('./homepage')
    } catch (error) {
        res.status(500).send('New post not published: ' + error.message)
    }
})

// get edit post
router.get('/editpost/:id', async (req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).send('Post not found')
        }
        const isEdited = post.isEdited
        res.render('users/editpost', {
            title: 'Edit Page',
            post,
            isEdited
        })
    } catch (error) {
        console.error('Error fetching post:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// get edit comment
router.get('/editcomment/:id', async (req, res) => {
    try {
        const commentId = req.params.id
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).send('Comment not found')
        }
        const isEdited = comment.isEdited
        res.render('users/editcomment', {
            title: 'Edit Page',
            comment,
            isEdited
        })
    } catch (error) {
        console.error('Error fetching comment:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// put edit comment
router.put('/editcomment/:id', async (req, res) => {
    try {
        const commentId = req.params.id
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).send('Comment not found')
        }
        if (comment.author !== req.session.username) {
            return res.status(403).send('You are not authorized to edit this comment!');
        }
        await Comment.findByIdAndUpdate(commentId, {
            body: req.body.comment_body,
            isEdited: true
        });
        res.redirect('../homepage');
    } catch (error) {
        console.error('Error fetching comment:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// delete comment
router.delete('/editcomment/:id', async (req, res) => {
    try {
        const commentId = req.params.id
        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.status(404).send('Comment not found')
        }
        if (comment.author !== req.session.username) {
            return res.status(403).send('You are not authorized to delete this comment!');
        }
        await Comment.findByIdAndDelete(commentId);
        res.redirect('../homepage');
    } catch (error) {
        console.error('Error fetching comment:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// put edit post
router.put('/editpost/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.author !== req.session.username) {
            return res.status(403).send('You are not authorized to edit this post!');
        }
        await Post.findByIdAndUpdate(postId, {
            title: req.body.post_title,
            body: req.body.post_body,
            community: req.body.community,
            isEdited: true
        });
        res.redirect('../homepage');
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// delete a post
router.delete('/editpost/:id', async (req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).send('Post not found')
        }
        if (post.author !== req.session.username) {
            return res.status(403).send('You are not authorized to delete this post!')
        }
        await Post.findByIdAndDelete({_id: postId})
        res.redirect('../homepage')
    } catch (error) {
        res.status(500).send('Failed to delete post: ' + error.message)
    }
});

// upvote a post
router.get('/editpost/upvote/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const username = req.session.username
        const user = await User.findOne({ username })
        if (!postId) {
            return res.status(404).send('Post not found');
        }
        const postIdObject = new mongoose.Types.ObjectId(postId);
        if (user.upvotedPosts.includes(postIdObject)) {
            return res.status(400).send('You have already upvoted this post!');
        } else {
            await Post.findByIdAndUpdate(postId, { $inc: { upvotes: 1 } }, { new: true });
            await User.findOneAndUpdate(
                { username },
                { $push: { upvotedPosts: postIdObject } },
                { new: true }
            )
        }
        res.redirect('/users/homepage');
    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// downvote a post
router.get('/editpost/downvote/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const username = req.session.username
        const user = await User.findOne({ username })
        if (!postId) {
            return res.status(404).send('Post not found');
        }
        const postIdObject = new mongoose.Types.ObjectId(postId);
        if (user.downvotedPosts.includes(postIdObject)) {
            return res.status(400).send('You have already downvoted this post!');
        } else {
            await Post.findByIdAndUpdate(postId, { $inc: { upvotes: -1 } }, { new: true })
            await User.findOneAndUpdate(
                { username },
                { $push: { downvotedPosts: postIdObject } },
                { new: true }
            )
        }
        res.redirect('/users/homepage');
    } catch (error) {
        console.error('Error downvoting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get edit comment
router.get('/editcomment', async (req, res) => {
    res.render('users/editcomment')
})

// classical
router.get('/classical', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/classical', {
            title: 'Home Page',
            posts: posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// country
router.get('/country', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/country', {
            title: 'Home Page',
            posts: posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// hip hop
router.get('/hiphop', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/hiphop', {
            title: 'Home Page',
            posts: posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// jazz
router.get('/jazz', async (req, res) => {
    const searchQuery = req.query.search
    const findUser = await User.findOne({ username: req.session.username })
    try {
        const posts = await Post.find();
        res.render('users/jazz', {
            title: 'Home Page',
            posts: posts,
            searchQuery,
            findUser
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// pop
router.get('/pop', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/pop', {
            title: 'Home Page',
            posts: posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// rock
router.get('/rock', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/rock', {
            title: 'Home Page',
            posts: posts
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

module.exports = router