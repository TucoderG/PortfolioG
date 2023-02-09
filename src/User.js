const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokenConfirm: {
        type: String,
        default: null

    },
    cuentaConfirmada: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function(next){ //antes de guardar un usuario en la BD

    const user = this;

    if(!user.isModified('password')) return next(); //validamos si el usuario es nuevo o la contraseña ya fue modificada
    try{
        
        const saltRounds = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, saltRounds)

        user.password = hash; //nuestro ps es el mismo hash
        
        next();

    }catch(error){
        console.log(error);
        next();
    }
    
});

UserSchema.methods.isCorrectPassword = async function(candidatePassword){ //comparo la pass que me pasan con la que tengo encriptada en el sistema
    return await bcrypt.compare(candidatePassword, this.password);
}


module.exports = mongoose.model('User', UserSchema);