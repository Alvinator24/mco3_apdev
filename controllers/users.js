const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator');

const User = require('../models/users')
const Post = require('../models/post')
const Comment = require('../models/comment')

// new user (displaying the form)
router.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register Page'
    })
})

// register new user
router.post('/register', async (req, res) => {
    try {
        const { lastname, firstname, email, mobilenumber, username, password, confirmpassword, bio, agree } = req.body;

        const newUser = new User({
            lastname: lastname,
            firstname: firstname,
            email: email,
            mobilenumber: mobilenumber,
            username: username,
            password: password,
            confirmpassword: confirmpassword,
            bio: bio,
            agree: agree
        });

        await newUser.save();
        res.redirect('/');
    } catch (error) {
        res.render('/users/register', {
            user: req.body,
            errorMessage: 'Error creating new user'
        });
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
        console.log(req.session.username)
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
    // const = findUser._id
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

// edit settings page
router.put('/settings/:id', async (req, res) => {
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
    const searchQuery = req.query.search
    const findUser = await User.findOne({ username: req.session.username })
    try {
        const posts = await Post.find()
        res.render('users/homepage', {
            title: 'Home Page',
            posts: posts,
            searchQuery,
            findUser
        });
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});

// get comments
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
        res.render('users/comments', {
            title: 'Comments', 
            comments
        })
    } catch (error) {
        console.error('Error fetching comments:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }  
})

// publish post
router.post('/homepage', async (req, res) => {
    try {
        const { post_title, post_body, community } = req.body
        const newPost = new Post({
            title: post_title,
            body: post_body,
            community
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
        res.render('users/editpost', {
            title: 'Edit Page',
            post: post,
        })
    } catch (error) {
        console.error('Error fetching post:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// put edit post
router.put('/editpost/:id', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.post_title,
            body: req.body.post_body,
            community: req.body.community
        })
        res.redirect('../homepage')
    } catch (error) {
        console.error('Error updating post:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// delete a post
router.delete('/editpost/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        await Post.findByIdAndDelete({_id: postId})
        res.redirect('../homepage')
    } catch (error) {
        res.status(500).send('Failed to delete post: ' + error.message)
    }
});

// publish comment
router.post('/comments', async (req, res) => {
    try {
        const { comment } = req.body
        const newComment = new Comment({
            body: comment
        })
        await newComment.save()
        res.redirect('./comments')
    } catch (error) {
        res.status(500).send('New comment not published: ' + error.message)
    }
})

// upvote a post
router.put('/homepage', async (req, res) => {
    try {
        const postId = req.params.postId
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).send('Post not found')
        }
        post.upvotes += 1
        await post.save()
        // res.send('Post upvoted successfully!');
        res.redirect('./homepage')
    } catch (error) {
        res.status(500).send('Failed to upvote post: ' + error.message);
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
    try {
        const posts = await Post.find();
        res.render('users/jazz', {
            title: 'Home Page',
            posts: posts
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