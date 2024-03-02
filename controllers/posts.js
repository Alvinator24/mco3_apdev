const router = require('express').Router()
const post = require('../models/post')

const Post = require('../models/post')

// create a post
router.post('/posts/create', async (req, res) => {
    const newPost = new post(req.body)
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

// update a post
router.patch('/posts/update/:id', async (req, res) => {
    try {
        const updatePost = await post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.updateOne({$set:req.body})
            res.status(200).json('Post has been updated')
        } else {
            res.status(403).json('Cannot updates posts not made by you')
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// delete a post
router.delete('/posts/update/:id', async (req, res) => {
    try {
        const updatePost = await post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json('Post has been deleted')
        } else {
            res.status(403).json('Cannot delete posts not made by you')
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// get a post
router.get('/posts/:id', async (req, res) => {
    try {
        const getPost = await post.findById(req.params.id)
        res.status(200).json(getPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

// like dislike post
router.patch('/posts/:id/like', async (req, res) => {
    try {
        const likePost = await post.findById(req.params.id)
        // use a likes array to store the users that have liked the post
        // get the length of that array to determine the total amount of likes
        // users can like their own posts too
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: { likes: req.body.userId } })
            res.status(200).json('Post has been liked')
        } else {
            await post.updateOne({$pull: { likes: req.body.userId } })
            res.status(200).json('Post has been disliked')
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// get all posts of a specific user (timeline)
router.get('/timeline', async (req, res) => {
    // try {
    //     const currentUser = await user.findById(req.body.userId)
    //     const userPosts = await post.findById({ userId: currentUser._id })
    //     const friendPosts = await Promise.all(
    //         currentUser.followings.map(friendId => {
    //             post.find({ userId: friendId })
    //         })
    //     )
    //     res.json(userPosts.concat(...friendPosts))
    // } catch (error) {
    //     res.status(500).json(error)
    // }  
})

// get all posts (homepage)
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('users/homepage', { posts });
        // res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }  
})

module.exports = router