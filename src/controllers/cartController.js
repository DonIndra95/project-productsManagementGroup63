const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");

const createCart = async (req, res) => {
  try {
    let data = req.body;
    userId = req.params.userId;

    let { productId, cartId } = data;

    if (!isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid productId" });

    let thisProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!thisProduct)
      return res.status(400).send({
        status: false,
        message: "Product has been deleted or doesnt exists",
      });

    if (cartId) {
      if (!isValidObjectId(cartId))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid cartId" });

      let checkCartId = await cartModel.findById(cartId);

      if (checkCartId.userId != userId)
        return res
          .status(400)
          .send({ status: false, message: "User is not authorized" });

      if (!checkCartId)
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid cartId" });

      let update = {};
      let products = checkCartId.items;
      let flag = false;
      let i = 0;

      for (i = 0; i < products.length; i++) {
        if (products[i].productId == productId) {
          flag = true;
          break;
        }
      }

      if (flag == true) {
        update[`items.${i}.quantity`] = checkCartId.items[i].quantity + 1;
        update.totalPrice = checkCartId.totalPrice + thisProduct.price;
      } else {
        update["$push"] = { items: { productId: productId, quantity: 1 } };
        update.totalPrice = checkCartId.totalPrice + thisProduct.price;
        update.totalItems = checkCartId.totalItems + 1;
      }

      let updatedCart = await cartModel.findOneAndUpdate(
        { _id: cartId },
        update,
        { new: true }
      );
      return res
        .status(200)
        .send({ status: true, message: "Success", data: updatedCart });
    } else {
      let cart = await cartModel.findOne({ userId: userId });

      //implement for not enetring cartId in request body

      if (cart)
        return res.status(400).send({
          status: false,
          message: "Cart already present for this user",
        });

      let created = {};
      created.userId = userId;
      created.items = { productId: productId, quantity: 1 };
      created.totalPrice = thisProduct.price;
      created.totalItems = 1;

      let savedData = await cartModel.create(created);

      return res
        .status(201)
        .send({ status: true, message: "Success", data: savedData });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};
//if update is empty
//if request body is empty
//cartId belongs to the same userId
const updateCart = async (req, res) => {
  try {
    let { cartId, productId, removeProduct } = req.body;

    if (!isValidObjectId(cartId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid cartId" });

    if (!isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid productId" });

    if (removeProduct != 1 && removeProduct != 0)
      return res.status(400).send({
        status: false,
        message: "Please enter valid removeProduct value as 1 or 0",
      });

    let checkCartId = await cartModel.findById(cartId);

    if (!checkCartId)
      return res
        .status(404)
        .send({ status: false, message: "CartId doesnt exists" });

    let thisProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!thisProduct)
      return res.status(400).send({
        status: false,
        message: "Product has been deleted or doesnt exists",
      });

    let update = {};
    let product = checkCartId.items;
    let quantity = 0;

    for (let i = 0; i < product.length; i++) {
      if (product[i].productId == productId) {
        quantity = product[i].quantity;
        break;
      }
    }

    if (removeProduct == 0 || quantity == 1) {
      update["$pull"] = { items: { productId: productId } };

      for (let i = 0; i < product.length; i++) {
        if (product[i].productId == productId) {
          update.totalPrice =
            checkCartId.totalPrice - thisProduct.price * product[i].quantity;
          update.totalItems = checkCartId.totalItems - 1;
          break;
        }
      }
    } else if (removeProduct == 1) {
      for (let i = 0; i < product.length; i++) {
        if (product[i].productId == productId) {
          update[`items.${i}.quantity`] = checkCartId.items[i].quantity - 1;

          update.totalPrice = checkCartId.totalPrice - thisProduct.price;
          break;
        }
      }
    }

    console.log(update);

    let updatedCart = await cartModel.findOneAndUpdate(
      { _id: cartId },
      update,
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Success", data: updatedCart });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};

//populate ??

const getCart = async (req, res) => {
  try {
    let userId = req.params.userId;

    let validCart = await cartModel
      .findOne({ userId: userId })
      //.populate("items.productId.poduct")
      .select({ "items._id": 0, __v: 0 });
    if (!validCart)
      return res.status(404).send({ status: false, message: "No cart found" });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: validCart });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


//can it be deleted twice ?

const deleteCart = async (req, res) => {
  try {
    let userId = req.params.userId;
  
    let validCart = await cartModel.findOne({ userId: userId });

    if (!validCart)
      return res.status(404).send({ status: false, message: "No cart found" });

    let empty = [];

    validCart.items = empty;
    validCart.totalPrice = 0;
    validCart.totalItems = 0;

    await validCart.save();

    return res.status(204).send({ status: true, message: "Success" });
    
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { createCart, updateCart, getCart, deleteCart };
