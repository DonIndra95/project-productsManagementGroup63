const { uploadFile } = require("../aws/aws")
const productModel=require("../models/productModel")


const createProduct=async (req,res)=>{
    try {
        
        let data= req.body

        let file=req.files

        data.currencyId="INR"
        data.currencyFormat="₹"        

        if (file && file.length > 0) {
            let productImage = await uploadFile(file[0]);
            if (productImage.error)
              return res
                .status(400)
                .send({ status: false, message: productImage.error });
            data.productImage = productImage;
          } else
            return res
              .status(400)
              .send({ status: false, message: "Please upload product image" });

        let savedData=await productModel.create(data)

        res.status(201).send({
            status: true,
            message: "Product created successfully",
            data: savedData,
          });
        
    } catch (err) {

        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const getProducts=async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const getProductDetails=async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const updateProduct=async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const deleteProduct=async (req,res)=>{
    try {
        
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}


module.exports={createProduct,getProducts,getProductDetails,updateProduct,deleteProduct}