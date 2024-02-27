const express = require('express')
const router = express.Router()

const user = require('../models/users')

// new user route (displaying the form)
router.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register Page'
    })
})

// register new user route
router.post('/register', (req, res) => {

    const { lastname, firstname, email, mobilenumber, username, password, confirmpassword, bio, agree } = req.body;

    const newUser = new user({
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
      
    // Check if password and confirmPassword match
    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Password and confirmpassword do not match.' });
    }

    newUser.save()
    .then((newUser) => {
        res.redirect('./login')
    })
    .catch((error) => {
        res.render('/users/register', {
            user: newUser,
            errorMessage: 'Error creating new user'
        })
    })
})

// login (displaying the form)
router.get('/login', (req, res) => {
    res.render('users/login', {
        // layout: 'login',
        title: 'Login Page'
    })
})

// successfully logged in
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Replace the checkUserCredentials function with your actual authentication logic
        // using hashing with bcrypt
        const existingUser = await user.findOne({ username: username });
    
        if (!existingUser) {
            return res.render('users/login', {
                errorMessage: 'User not found'
            });
        }
    
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
        if (isPasswordValid) {
            res.send('Successfully logged in');
             // or redirect to a success page: res.render('success', { message: 'Successfully logged in' });
        } else {
            res.render('users/login', {
                errorMessage: 'Invalid password'
            });
                // or redirect to an error page: res.render('error', { message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

    // const user = users.find(user => user.username === username)
    // if (user == null) {
    //     return res.status(400).send('Cannot find user')
    // }
    // try {
    //     if ( await bcrypt.compare(password, user.password)) {
    //         res.send('Succesfully logged in')
    //     } else {
    //         res.send('Cannot log in')
    //     }
    // } catch {
    //     res.status(500).send()
    // }


    // Replace the checkUserCredentials function with your actual authentication logic
    // using hashing with bcrypt
    // const isAuthenticated = checkUserCredentials(username, password);

    // if (isAuthenticated) {
    //     res.render('success', { message: 'Successfully logged in' });
    // } else {
    //     res.render('error', { message: 'Invalid credentials' });
    // }


module.exports = router