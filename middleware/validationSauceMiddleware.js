const jwt = require('jsonwebtoken');
const generalRegex = /^[_A-z0-9]*((-|\s)*[?-zÀ-ÿ!-;\s])*$/;
const Sauce = require('../models/sauce');

module.exports = (req, res, next) => {
    try {
        if(generalRegex.test(req.body.name)==true && generalRegex.test(req.body.manufacturer)==true &&
            generalRegex.test(req.body.description)==true && generalRegex.test(req.body.mainPepper)==true)
        {
            next();
        }
        else {
            return res.status(403).json({ error: 'Bad request' });
        }
    }
    catch
    {
        res.status(401).json({error: new Error('Invalid request!')});
    }
};
