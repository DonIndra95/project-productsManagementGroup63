const productModel = require("../models/productModel");

const { isValidRequest, isValid } = require("./userValidations");

//function for valid title
const isValidTitle = (value) => {
  return /^[a-zA-Z0-9 .-]{2,30}$/.test(value);
};
//function to remoce extra spaces
const removeSpaces = (value) => {
  value = value
    .split(" ")
    .filter((e) => e)
    .join(" ");
  return value;
};

//function to checkprice
// const isValidPrice = (value) => {
//   if (typeof value == "undefined" || value == null) return false;
//   if (typeof value !== "number") return false;
//   return true;
// };

//function for checkstyle
const isValidStyle = (value) => {
  return /^[a-zA-Z0-9 .-]{2,30}$/.test(value);
};

// function for array value verification
const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    if (x.trim().length) arrValue.push(x);
  });
  return arrValue.length ? arrValue : false;
};

// function for converting string into array
const convertToArray = function (value) {
  if (typeof value === "string" && value) {
    if (value.trim().length == 0) return false;
    return value.split(",").filter((x) => x);
  } else if (value?.length > 0) return checkValue(value);
  return false;
};

const createProductValidations = async (req, res, next) => {
  try {
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let {
      title,
      description,
      price,
      style,
      availableSizes,
      installments,
      isDeleted,
    } = req.body;

    let data = {};

    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Please enter title" });

    if (!isValidTitle(title))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid title" });

    title = removeSpaces(title);

    if (!isValid(description))
      return res
        .status(400)
        .send({ status: false, message: "Please enter description" });

    if (!isValidTitle(description))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid description" });

    data.description = removeSpaces(description);

    if (!isValid(price))
      return res.status(400).send({
        status: false,
        message: "Please enter price ",
      });
    if (!/^[0-9]*$/.test(price))
      return res.status(400).send({
        status: false,
        message: "Please enter valid price in numbers only",
      });

    data.price = Math.round(price * 100) / 100;

    if (style?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter a style" });

    if (style) {
      if (!isValid(style))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a style" });

      if (!isValidStyle(style))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid style" });
      data.style = style;
    }

    let allowedSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];

    sizes = convertToArray(availableSizes);

    if (!sizes)
      return res
        .status(400)
        .send({ status: false, message: "Please enter atleast one size" });

    let check = true;
    sizes.map((e) => {
      if (!allowedSizes.includes(e)) return (check = false);
    });

    if (!check)
      return res.status(400).send({
        status: false,
        message: "Sizes can only be S, XS, M, X, L, XL, XXL",
      });
    data.availableSizes = sizes;

    if (installments?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter installments" });

    if (installments) {
      if (!isValid(installments))
        return res.status(400).send({
          status: false,
          message: "Please enter installments",
        });

      if (!/^[0-9]*$/.test(installments))
        return res.status(400).send({
          status: false,
          message: "Please enter valid number for installments",
        });

      data.installments = installments;
    }

    if (isDeleted && isDeleted === true)
      return res.status(400).send({
        status: false,
        message: "Cannot delete during creation",
      });

    let file = req.files;

    if (file.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please upload an image" });

    let allowedExtension = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];

    if (!allowedExtension.includes(file[0].mimetype))
      return res
        .status(400)
        .send({ status: false, message: "Image should be in required format" });

    let checkTitle = await productModel.findOne({ title: title });
    if (checkTitle)
      return res
        .status(400)
        .send({ status: false, message: `'${title}' already exists` });

    data.title = title;

    console.log(data);

    req.update = data;

    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createProductValidations, isValidTitle };
