const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator');
// const session = require('express-session')

const User = require('../models/users')
const Post = require('../models/post')
const Comment = require('../models/comment')

// new user route (displaying the form)
router.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register Page'
    })
})


// register new user route
router.post('/register', (req, res) => {

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
    })

    // if (password !== confirmpassword) {
    //     return res.render('users/register', {
    //         user: req.body,
    //         errorMessage: 'Passwords do not match'
    //     });
    // }

    // form validation
    const validateForm = [
        body('username').isLength({ min: 5 }).withMessage('Username must be at least 3 characters'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 6 characters'),
      ];
      
    // Check if password and confirmPassword match
    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Password and confirmpassword do not match.' });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    newUser.save()
    .then((newUser) => {
        res.redirect('/')
    })
    .catch((error) => {
        res.render('/users/register', {
            user: newUser,
            errorMessage: 'Error creating new user'
        })
    })
})


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
        return res.redirect('./homepage')
      }

    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' });
    }
});


// settings page
router.get('/settings', (req, res) => {
    res.render('users/settings', {
        title: 'Settings Page'
    })
})

// homepage not logged in
router.get('/notloggedinhomepage', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/notloggedinhomepage', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// homepage logged in
router.get('/homepage', async (req, res) => {
    const searchQuery = req.query.search;

    try {
        const posts = await Post.find();
        res.render('users/homepage', {
            title: 'Home Page',
            posts: posts,
            searchQuery: searchQuery
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.render('users/comments', {
            title: 'Comments', 
            comments
            // comments: comments
        });
        // res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

        // res.send('New post published!')
        res.redirect('./homepage')
    } catch (error) {
        res.status(500).send('New post not published: ' + error.message)
    }
})

// get editpost page
// router.get('/homepage', async (req, res) => {
//     res.redirect('./editpost')
//     res.send('welcome to edit post')
// })

// get edit post
router.get('/editpost/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('users/editpost', {
            title: 'Edit Page',
            post: post,
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// delete a post
router.delete('/homepage/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        await Post.findByIdAndDelete({_id: postId});
        res.redirect('./homepage')
    } catch (error) {
        res.status(500).send('Failed to delete post: ' + error.message);
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
router.patch('/homepage', async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        post.upvotes += 1;

        await post.save();

        // res.send('Post upvoted successfully!');
        res.redirect('./homepage')
    } catch (error) {
        res.status(500).send('Failed to upvote post: ' + error.message);
    }
});

// edit comment
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
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// country
router.get('/country', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/country', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// hip hop
router.get('/hiphop', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/hiphop', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// jazz
router.get('/jazz', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/jazz', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// pop
router.get('/pop', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/pop', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// rock
router.get('/rock', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/rock', {
            title: 'Home Page',
            posts: posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router