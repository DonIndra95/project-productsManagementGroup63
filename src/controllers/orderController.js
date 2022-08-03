const { isValidObjectId } = require("mongoose");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const { isValidRequest } = require("../validations/userValidations");
const cartModel = require("../models/cartModel");
const { deleteCart } = require("./cartController");

const createOrder = async function (req, res) {
  try {
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    userId = req.params.userId;

    let { productId, cancellable, status } = req.body;

    // if(!isValidObjectId(productId))
    //return res.status(400).send({status:false,message:"Please enter valid productId"})

    //let availableProduct = await productModel.findOne({_id:productId,isDeleted:false})

    //if(!availableProduct)
    //return res.status(400).send({status:false,message:"Product not available or have been deleted"});

    //   if(totalQuantity){
    //     (!/^[1-9][0-9]?$/.test(totalQuantity))
    //     return res.status(400).send({status:false,message:"Please enter a valid quantity number"})
    //    }

    if (cancellable?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter the required value" });

    if ((cancellable != true && cancellable != false) || cancellable == null)
      return res
        .status(400)
        .send({
          status: false,
          message: "cancellable value should be either true or false",
        });

    let cart = await cartModel
      .findOne({ userId: userId })
      .populate("items.productId");
    if (!cart)
      return res.status(400).send({ status: false, message: "cart not found" });

    let order = {};

    let totalQuantity = 0;
    // let items = cart.items
    cart.items.forEach((e) => {
      if (e.productId.isDeleted == true) {
        cart.totalPrice -= e.productId.price * e.quantity;
        cart.totalItems--;
        cart.items.splice(cart.items.indexOf(e), 1);
      } else if (e.productId.isDeleted == false) totalQuantity += e.quantity;
    });

    // console.log(totalQuantity,cart)

    order.userId = userId;
    order.items = cart.items;
    order.totalPrice = cart.totalPrice;
    order.totalItems = cart.totalItems;
    order.totalQuantity = totalQuantity;
    order.cancellable = cancellable;
    order.status = status;
    await cart.save(); // This data is saved in db if changes occur
    if (cart.items.length == 0)
      return res.status(400).send({ status: false, message: "cart is empty" });

    let createdOrder = await orderModel.create(order);
    return res
      .status(201)
      .send({ status: true, message: "success", data: createdOrder });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateOrder= async (req,res)=>{
  try {

    userId=req.params.userId

    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let{orderId,status}=req.body

    if(!isValidObjectId(orderId))
    return res
        .status(400)
        .send({ status: false, message: "Please enter valid orderId" });

    let thisOrder=await orderModel.findOne({_id:orderId,isDeleted:false})

    if(!thisOrder)
    return res
        .status(404)
        .send({ status: false, message: "Order not found or is deleted" });

    if(thisOrder.userId !=userId)
    return res
        .status(403)
        .send({ status: false, message: "User is not authorized to place this order" });

    if(thisOrder.cancellable==false&&status=="cancelled")
    return res
        .status(400)
        .send({ status: false, message: "This order can not be cancelled" });

    if(status=="completed"){

      let validCart = await cartModel.findOne({ userId: userId });

    if (!validCart)
      return res.status(404).send({ status: false, message: "No cart found" });

    if (validCart.items.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "No items found inside cart" });

    let empty = [];

    validCart.items = empty;
    validCart.totalPrice = 0;
    validCart.totalItems = 0;

    await validCart.save();

    }

    let updatedOrder= await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})

    res.status(200).send({status:true,message:"Success",data:updatedOrder})
    
  } catch (err) {

    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
    
  }
}

module.exports = { createOrder,updateOrder };
