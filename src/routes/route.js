const express= require("express")
const { userRegister } = require("../controllers/userController")
const { userValidation } = require("../validations/userValidations")
const router= express.Router()

//User API

router.post("/register",userValidation,userRegister)

module.exports=router