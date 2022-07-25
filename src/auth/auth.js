const jwt = require('jsonwebtoken')


const userAuthentication = async function(req, res, next){

    try {

       

    } catch (err) {

        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = {userAuthentication}