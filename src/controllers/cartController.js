const { isValidObjectId } = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");

const createCart = async (req, res) => {
  try {

    let data = req.body;
    userId = req.params.userId;

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid userId" });

    if (data.cartId) {
      if (!isValidObjectId(data.cartId))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid cartId" });

      let checkCartId = await cartModel.findOne({ _id: cartId }); //.populate("product")

      if (checkCartId) {
        let productId = data.productId.trim().split(",");

        if (!isValidObjectId(productId))
          return res
            .status(400)
            .send({ status: false, message: "Please enter valid productId" });

        let products = await productModel.find(
          { _id: { $in: productId } },
          { isDeleted: false }
        );

        if (!products)
          return res
            .status(404)
            .send({ status: false, message: "No products found" });

        let totalPrice = 0;
        let totalItems = 0;

        let productList = [];

        products.forEach((product) => {
          totalPrice += product.price;
          totalItems++;

          productList.push({ productId: product._id, quantity: 1 });
        });
      }
    }
    
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteCart = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
module.exports = { createCart, updateCart, getCart, deleteCart };
