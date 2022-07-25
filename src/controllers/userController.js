const userModel= require("../models/userModel")
const aws= require("aws-sdk")
const bcrypt=require("bcrypt")
const { uploadFile } = require("../aws/aws")
const validator = require('../validations/userValidations')
const userRegister=async (req,res)=>{
    try {
        let data= req.register
        let file=req.files

        if(file&& file.length>0){
            let profileImage= await uploadFile(file[0]);
            if(profileImage.error)return res.status(400).send({status:false,message:profileImage.error})
            data.profileImage=profileImage;
          }else return res.status(400).send({status:false,message:"Please upload file"})        

        let savedData=await userModel.create(data)

        res.status(201).send({status:true,message:"User created successfully",data:savedData})
        
    } catch (err) {
        return res.status(500).send({status:false,message:err.message})        
    }

}

// =====================================================getApi============================================
const getUserDetails = async function (req, res) {

    try {

        const userId = req.params.userId
        const userIdFromToken = req.userId


        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        const findUserDetails = await userModel.findById(userId)

        if (!findUserDetails) {
            return res.status(404).send({ status: false, message: "User Not Found!!" })
        }

        if (findUserDetails._id.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: "You Are Not Authorized!!" });
        }

        return res.status(200).send({ status: true, message: "Profile Fetched Successfully!!", data: findUserDetails })

    } catch (err) {

        return res.status(500).send({ status: false, error: err.message })

    }
}

module.exports={userRegister,getUserDetails}