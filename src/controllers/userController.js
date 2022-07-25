const userModel= require("../models/userModel")
const aws= require("aws-sdk")
const bcrypt=require("bcrypt")
const { uploadFile } = require("../aws/aws")

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
module.exports={userRegister}