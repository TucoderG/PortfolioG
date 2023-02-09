const User = require("./User");
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');


//Plantilla de inicio
const inicio = (req, res) =>{
    res.render('index');
}

//Plantilla de session
const singin = (req, res)=>{
    res.render('singin');
}

//formulario de registro por peticion POST
const registerForm = async (req, res) =>{

    const errors = validationResult(req) //registramos los errores del formulario
    if(!errors.isEmpty()){
        req.flash('mesajes', errors.array());
        return res.redirect('/singin');
    }

    const {username, email, password} = req.body;

    try{
        //verificar que no exista el usuario
        let user = await User.findOne({email: email});
        if(user){
            req.flash('mesajes', [{msg: 'Ya existe ese email...'}] );
            return res.redirect('/singin');
        }
        
        // crear y guardar el usuario
        
        user = new User({username, email, password, tokenConfirm: uuidv4()});// uuidv4 genera un token
        await user.save();


        // enviar correo electronico con confirmacion de cuenta
        var message = {
            from: 'NoReplyPortfolioG@gmail.com',
            to: email,
            subject: "Confirmacion de cuenta",
            html: `<p>Link para la validacion: <br> <a href='https://tucoderg.github.io/PortfolioG/confirmarCuenta/${user.tokenConfirm}'>Ingrese aquí</a></p>`
        };
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAILNOREPLY,
                pass: process.env.PASSNOREPLY
            }
        })
        transporter.sendMail(message, (error, info) => {
            
            if (error) throw new Error(`Error enviando email - ${error.message}`);
            
            req.flash('mesajes', [{msg: 'Revise su correo electronico y valide su cuenta.'}]);
            return res.redirect('/singin');
            
        })

    }catch(error){
        req.flash('mesajes', [{msg: error.message}]);
        return res.redirect('/singin');
    }
}

//confirmacion de cuenta mediante el email
const confirmarCuenta = async (req, res) =>{
    const {token} = req.params;

    try{
        const user = await User.findOne({ tokenConfirm: token });

        if(!user) throw new Error('No existe el usuario.');
        
        user.cuentaConfirmada = true
        user.tokenConfirm = null

        await user.save();

    }catch(error){

        req.flash('mesajes', [{msg: error.message}]);
    }
    return res.redirect('/singin');
}

//logueo del usuario a su cuenta + inicio de session
const loginUser = async (req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        req.flash('mesajes', errors.array());
        return res.redirect('/singin');
    }

    
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email})

        if(!user) throw new Error('El email no existe');
        if(!user.cuentaConfirmada) throw new Error('No se confirmo su cuenta');
        if(await !user.isCorrectPassword(password)) throw new Error('Contraseña incorrecta.');

        req.login(user, function(err){
            if(err) throw new Error('Error al crear la session.');
            return res.redirect('/');
        })
        
    }catch(error){
        req.flash('mesajes', [{msg: error.message}]);
        return res.redirect('/singin');
    }
};

//outlogueo del usuario y su session
const cerrarSession = (req, res) =>{
    try{
        req.logout((err) =>{
            if(err) throw new Error('Error al cerrar la session.');
            return res.redirect('/singin');
        });
    }catch(error){
        req.flash('mesajes', [{msg: error.message}]);
        return res.redirect('/singin');
    }

}

//Plantilla
const recuperarContraseña = (req, res) =>{
    res.render('password');
}

//Ingreso y envio de email
const recovPass = async (req, res) =>{
    const errors = validationResult(req) //registramos los errores del formulario
    if(!errors.isEmpty()){
        req.flash('mesajes', errors.array());
        return res.redirect('/recover');
    }

    const {email} = req.body;

    const user = await User.findOne({email})
    user.tokenConfirm = uuidv4();
    user.save();

    try{
        if(!user) throw new Error('El usuario ingresado no existe.');
        if(!user.cuentaConfirmada) throw new Error('No se confirmo su cuenta');

        var message = {
            from: 'NoReplyPortfolioG@gmail.com',
            to: email,
            subject: "Recuperar Contraseña",
            html: `<p>Link para cambiar su contraseña: <br> <a href='https://tucoderg.github.io/PortfolioG/recover/${user.tokenConfirm}'>Ingrese aquí</a></p>`
        };
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAILNOREPLY,
                pass: process.env.PASSNOREPLY
            }
        });
        transporter.sendMail(message, (error, info) => {
            
            if (error) throw new Error(`Error enviando email - ${error.message}`);
            
            req.flash('mesajes', [{msg: 'Revisa tu email.'}])
            return res.redirect('/recover');
            
        });

        
    }catch(err){
        req.flash('mesajes', [{msg: error.message}]);
        return res.redirect('/recover');
    }
}


//Verificar y establecer nueva contraseña
const recoverwithtoken = async (req, res) =>{
    const {token} = req.params;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        req.flash('mesajes', errors.array());
        return res.redirect(`/recover/${token}`);
    }
    
    const {password} = req.body;

    try{
        const user = await User.findOne({ tokenConfirm: token });
        
        if(!user) throw new Error('No existe un usuario con ese token.');
        
        user.password = password;
        user.tokenConfirm = null;
        await user.save();

        res.redirect('/singin')

    }catch(error){

        req.flash('mesajes', [{msg: error.message}]);
        res.redirect('/recover')
    }
}

module.exports = {
    inicio,
    registerForm,
    confirmarCuenta,
    loginUser,
    cerrarSession,
    singin,
    recuperarContraseña,
    recovPass,
    recoverwithtoken,
}