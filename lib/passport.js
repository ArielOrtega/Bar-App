const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM usuario WHERE Nombre = ?', [username]);
    if(rows.length > 0){
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.Contrasena)
        if(validPassword){
            done(null, user, req.flash('success','Bienvenido '+ user.Nombre));
        }else{
            done(null, false, req.flash('message','Contraseña incorrecta'));
        }
    }else{
        return done(null, false, req.flash('message','El usuario no existe'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true

}, async (req, username, password, done) => {
    const newUser = {
        Nombre: username,
        Contrasena: password
    };
    newUser.Contrasena = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO usuario SET ?', [newUser]);
    newUser.UsuarioId = result.insertId;
    return done(null, newUser);
}));

passport.serializeUser((user, done) =>{
    done(null, user.UsuarioId);
});

passport.deserializeUser(async (UsuarioId, done) => {
    const rows = await pool.query('SELECT * FROM usuario WHERE UsuarioId = ?', [UsuarioId]);
    done(null, rows[0]);
})