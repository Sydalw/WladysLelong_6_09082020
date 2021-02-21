const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const keyValueToken = process.env.key_value_token;
const MaskData = require('maskdata');


//const emailMask2Options = {
//    maskWith: "*",
//    unmaskedStartCharactersBeforeAt: 0,
//    unmaskedEndCharactersAfterAt: 257, // Give a number which is more than the characters after @
//    maskAtTheRate: false
//};

exports.signup = (req, res, next) => {
    const maskedEmail = MaskData.maskEmail2(req.body.email);
    console.log(maskedEmail);
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
            email: maskedEmail,
            password: hash
        });
        user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
        const maskedEmail = MaskData.maskEmail2(req.body.email);
    console.log(maskedEmail);
    User.findOne({ email: maskedEmail})
        .then(user => {
            if (!user) {
                return res.status(401).json({ error});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({error});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, keyValueToken, { expiresIn: '24h' })
                    });
                })
                .catch(error => res.status(502).json({ error }));
        })
        .catch(error => res.status(501).json({ error }));
};
