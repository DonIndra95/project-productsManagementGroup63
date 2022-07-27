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
       let query = req.query 
    const product = {isDeleted:false}
    if(query.size) product.availableSizes = query.size
    if(query.name) product.title = query.name
    if(query.priceGreaterThan) product.price = {$gt:query.priceGreaterThan}
    if(query.priceLessThan) product.price = {$lt:query.priceLessThan}
    if(query.priceGreaterThan&&query.priceLessThan) product.price = {$lt:query.priceLessThan,$gt:query.priceGreaterThan}
    console.log(product)

    const getProductDetails = await productModel.find(product).sort({price:query.priceSort})

  res.status(200).send({status:true,message:getProductDetails})

} catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const getProductDetails=async (req,res)=>{
    try {
        
        let productId = req.params.productId
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "No products found or product has been deleted" })
        res.status(200).send({ status: true, message:"Success", data: product })
} catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        }
}

const updateProduct=async (req,res)=>{
    try {

        let data = req.body
        let productId = req.params.productId
        let productUpdate = await productModel.findOneAndUpdate({_id:productId,isDeleted:false},data,{new:true})
        if(!productUpdate) return res.status(404).send({ status: false, message: "No products found or product has been deleted" })
        res.status(201).send({ status: true, message:"Success", data: productUpdate })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
        
    }
}

const deleteProduct=async (req,res)=>{
    try {
        let productId = req.params.productId
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "No products found or product has been deleted" })

        let deleteProduct = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date()} }, {new: true })
        res.status(200).send({ status: true, message: 'Success', data: deleteProduct })
} catch (err) {
        return res.status(500).send({ status: false, message: err.message });
     }
}


module.exports={createProduct,getProducts,getProductDetails,updateProduct,deleteProduct}