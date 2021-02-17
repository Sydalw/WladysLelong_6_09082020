const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
const User = require('../models/User');
const config = require('dotenv').config();

const keyValueToken = process.env.key_value_token;
var schema = new passwordValidator();

// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digit
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

const emailRegex = /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/;
const pwdRegex =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

exports.signup = (req, res, next) => {
    if(emailRegex.test(req.body.email)==true && pwdRegex.test(req.body.password)==true){
        if(schema.validate(req.body.password)==true){
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                    .catch(error => res.status(400).json({ error }));
                })
            .catch(error => res.status(500).json({ error }));
        }else{
            return res.status(417).json({ error: 'Mot de passe non conforme au format attendu !' });
        }
    }else{
        return res.status(417).json({ error: 'email non conforme au format attendu !' });
    }
};

exports.login = (req, res, next) => {
    if(emailRegex.test(req.body.email)==true && pwdRegex.test(req.body.password)==true){
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    return res.status(401).json({ error: 'Utilisateur non trouvé !' });
                }
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ error: 'Mot de passe incorrect !' });
                        }
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign({ userId: user._id }, keyValueToken, { expiresIn: '24h' })
                        });
                    })
                    .catch(error => res.status(502).json({ error }));
            })
            .catch(error => res.status(501).json({ error }));
    }else{
        return res.status(417).json({ error: 'email non conforme au format attendu !' });
    }
};
