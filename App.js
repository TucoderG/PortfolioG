const express = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const { body } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');

const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser'); 

const flash = require('connect-flash');
const passport = require('passport');
const csrf = require('csurf');
const path = require('path'); 

require('dotenv').config(options = {path: '.env'});


const {inicio, registerForm, confirmarCuenta, loginUser, cerrarSession, singin, recuperarContraseña, recovPass, recoverwithtoken} = require('./src/auth');
const User = require('./src/User');
const verificarUser = require('./src/verificarUser');
const clientDB = require('./database/ClientDB');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/views/public')));

app.engine('.mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use(flash());


// SESSION DE USUARIO //
var sess = {
    secret: process.env.SECRET,
    resave: false,                   //autoguardado de sesiones
    saveUninitialized: false,        //peticion de guardado de sesiones
    name: process.env.NOMBRESECRETO,
    sotre: MongoStore.create({
        clientPromise: clientDB,
    }),
    //cookie: {secure: true, maxAge: 30 * 24 * 30 * 60 * 60 * 1000} // el secure: true funciona solo con https, en desarrollo localhost no es https
}
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => 
    done(null, {id: user._id, userName: user.username}) // 2do parametro de done guarda los datos en el req.user
); 
passport.deserializeUser( async (user, done) => {
    const userDB = await User.findById(user.id); //verifico que exista el usuario en la DB para re hacer la session
    return done(null, {id: userDB._id, userName: userDB.username});

});

// CSRF Y EVITAR MONGO INJECTION
app.use(csrf());
app.use(mongoSanitize());


app.use((req, res, next) =>{
    res.locals.csrfToken = req.csrfToken();
    res.locals.mesajes = req.flash('mesajes');
    next();
})


/////////////////////////////////////////////////////


// HOME //
app.get('/', verificarUser, inicio);


// USUARIO //
app.get('/singin', singin);

//Registro de usuario
app.post('/register',
        [  
        body('username', 'Ingrese un nombre válido.') //verifica el name del elemento del body
            .trim()
            .notEmpty()
            .escape(),

        body('email', 'Ingrese un email válido.')
            .trim()
            .isEmail()
            .normalizeEmail(),
        
        body('password', 'Requiere contraseña de 8 carácteres minimo.')
            .trim()
            .isLength({min: 8})
            .escape()
            .custom((value, {req}) =>{ //aca puedo inventar validaciones
                if(value !== req.body.repassword){
                    throw new Error('No coinciden las contraseñas');
                }else{
                    return value;
                }
            })
        

    ],
    registerForm);

app.get('/confirmarCuenta/:token', confirmarCuenta);

// Ingreso de email
app.get('/recover', recuperarContraseña);

// Validando email
app.post('/recovPass',
    
    [body('email', 'Ingrese un email válido.')
        .trim()
        .isEmail()
        .normalizeEmail()
    ],
    
    recovPass);

//Ingreso de contraseña nueva
app.get('/recover/:token', recuperarContraseña);

//Validar nueva contraseña
app.post('/recovToken/:token',[
    body('password', 'Requiere contraseña de 8 carácteres minimo.')
            .trim()
            .isLength({min: 8})
            .escape()
            .custom((value, {req}) =>{ 
                if(value !== req.body.repassword){
                    throw new Error('No coinciden las contraseñas');
                }else{
                    return value;
                }
            })
], recoverwithtoken);

//Login de usuario
app.post('/loginUser', [

        body('username', 'Ingrese un nombre válido')
            .trim() 
            .notEmpty() 
            .escape(), 

        body('email', 'Ingrese un email válido.')
            .trim()
            .isEmail()
            .normalizeEmail(),
        
        body('password', 'Ingrese una contraseña de mínimo 8 carácteres')
            .trim()
            .isLength({min: 8})
            .escape()
            
    ],
    
    loginUser);

//Outlog de usuario
app.get('/logout', cerrarSession);


module.exports = app;