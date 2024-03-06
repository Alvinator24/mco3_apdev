const router = require('express').Router()

const Comment = require('../models/comment')

// get all comments
// router.get('/all', async (req, res) => {
//     try {
//         const comments = await Comment.find();
//         res.render('users/comments', {
//             title: 'Comments', 
//             comments
//         });
//         // res.json(comments);
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }  
// })

module.exports = router