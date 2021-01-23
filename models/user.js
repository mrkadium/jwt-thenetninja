const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimun password length is 6 characters']
    }
})

// mongoose hooks (like triggers)
// after (post) a save event occurs (trigger ai_user)
// userSchema.post('save', function(doc, next){
//     console.log('new user was created and saved', doc);
//     next() //needs to be called after every hook or middleware
// })

// trigger bi_user
userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//static method to login user
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email})
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user
        }
        throw Error('Incorrect password')
    }
    throw Error('Incorrect email')
}

//has to be the singular of the table name (in this case, "users")
const User = mongoose.model('user', userSchema)

module.exports = User