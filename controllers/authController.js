const User = require('../models/user')
const jwt = require('jsonwebtoken')

//error handlers
const handleErrors = (err) => {
    console.log(err.message, err.code);

    // let error = { email: '', password: '' }
    let errors = { } //for any property

    //incorrect email
    if(err.message === 'Incorrect email'){
        errors.email = 'That email is not registered'
    }
    //incorrect password
    if(err.message === 'Incorrect password'){
        errors.password = 'That password is incorrect'
    }

    //duplicate key error
    if(err.code === 11000){
        errors['email'] = 'The email you entered is already registered'
        return {errors: errors}
    }

    //validating errors
    if(err.message.includes('user validation failed')){
        // Object.values(err.errors).forEach(error => {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }

    return {errors: errors}
}

const maxAge = 3 * 24 * 60 * 60 //3 days in seconds
const createToken = (id) => {
    //the secret must be long and complicated, not as easy as this one
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup')
}
module.exports.login_get = (req, res) => {
    res.render('login')
}
module.exports.signup_post = async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await User.create({email, password})
        //we must not use delicate info for jwt or cookies
        const token = createToken(user._id)
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        })
        res.status(201).json({user: user._id})
    }catch(err){
        const errors = handleErrors(err)
        res.status(400).json(errors)
    }
}
module.exports.login_post = async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000 //3 days in miliseconds
        })
        res.status(200).json({user: user._id})
    }catch(err){
        const errors = handleErrors(err)
        res.status(400).json(errors)
    }
}
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {
        maxAge: 1 //1 milisecond, 'cause we cannot delete a cookie
    })
    res.redirect('/')
}