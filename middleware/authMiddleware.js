const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt

    //check if exists and if it's valid
    if(token){
        jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
            if(err){
                res.redirect('/login')
            }else{
                next() //keep going with the request
            }
        })
    }else{
        res.redirect('/login')
    }
}

//check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if(err){
                res.locals.user = null
                next()
            }else{
                let user = await User.findById(decodedToken.id)
                //it makes user visible for the views
                res.locals.user = user
                next()
            }
        })
    }else{
        res.locals.user = null
        next()
    }
}

module.exports = { requireAuth, checkUser }