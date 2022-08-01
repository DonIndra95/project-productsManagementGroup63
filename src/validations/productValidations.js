const { isValidObjectId } = require("mongoose");
const { uploadFile } = require("../aws/aws");
const productModel = require("../models/productModel");

const { isValidRequest, isValid } = require("./userValidations");

//function for valid title
const isValidTitle = (value) => {
  return /^[a-zA-Z0-9 .-]+$/.test(value);
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
  return /^[a-zA-Z]{2,30}$/.test(value); //change regex
};

// function for array value verification
const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    if (x.trim().length) arrValue.push(x.trim());
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
///////////////////////////////////-----------------------CREATE PRODUCT VALIDATIONS--------------------//////////////////////////////////////////
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
      isFreeShipping,
      currencyFormat,
      currencyId
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

    if(!isValid(currencyFormat))
    return res.status(400).send({
      status: false,
      message: "Please enter currencyFormat ",
    });

    if(currencyFormat!="INR"||currencyFormat!="USD")
    return res.status(400).send({
      status: false,
      message: "Currency format can either be INR or USD",
    });
    data.currencyFormat=currencyFormat

    if(!isValid(currencyId))
    return res.status(400).send({
      status: false,
      message: "Please enter currencyId ",
    });

    if(currencyId!="₹"||currencyId!="$")
    return res.status(400).send({
      status: false,
      message: "currencyId can either be ₹ or $",
    });

    if(currencyFormat=="INR"&&currencyId!="₹")
    return res.status(400).send({
      status: false,
      message: "currencyId should be ₹ for INR currency format",
    });

    if(currencyFormat=="USD"&&currencyId!="$")
    return res.status(400).send({
      status: false,
      message: "currencyId should be $ for USD currency format",
    });

    data.currencyId=currencyId

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

    if (isDeleted && isDeleted === "true")
      return res.status(400).send({
        status: false,
        message: "Cannot delete during creation",
      });

    if (isFreeShipping?.length == 0)
      return res.status(400).send({
        status: false,
        message: "Please enter isFreeShipping value",
      });

    if (isFreeShipping) {
      if (
        (isFreeShipping != "true" && isFreeShipping != "false") ||
        isFreeShipping == null
      )
        return res.status(400).send({
          status: false,
          message: "isFreeShipping can either be true or false",
        });
      data.isFreeShipping = isFreeShipping;
    }

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

    req.update = data;

    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
////////////////////////////-----------------------UPDATE PRODUCT VALIDATIONS--------------------//////////////////////////////////////////
const updateProductValidations = async (req, res, next) => {
  try {
    if (!isValidRequest(req.body) && !req.files)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    if (!isValidObjectId(req.params.productId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid productId" });

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
      isDeleted,
      deletedAt,
    } = req.body;

    if (title?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid title" });

    if (description?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid description" });
    if (price?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid price" });

    if (isFreeShipping?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid isFreeShipping" });

    if (style?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid style" });

    if (availableSizes?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid availableSizes" });

    if (installments?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid installments" });

    if (currencyId || currencyFormat || isDeleted || deletedAt)
      return res.status(400).send({
        status: false,
        message:
          "You cannot update currencyId,currencyFormat,deletedAt & isDeleted fields ",
      });

    let update = {};

    if (Object.hasOwn(req.body, "description")) {
      if (!isValid(description))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid description" });

      if (!isValidTitle(description))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid description" });

      update.description = removeSpaces(description);
    }

    if (Object.hasOwn(req.body, "price")) {
      if (typeof price != "string" && typeof price != "number")
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid price" });

      if (!/^[0-9]*$/.test(price))
        return res.status(400).send({
          status: false,
          message: "Please enter valid price in numbers only",
        });

      update.price = Math.round(price * 100) / 100;
    }

    if (Object.hasOwn(req.body, "isFreeShipping")) {
      if (
        (isFreeShipping != true &&
          isFreeShipping != "true" &&
          isFreeShipping != false &&
          isFreeShipping != "false") ||
        isFreeShipping === null
      )
        return res.status(400).send({
          status: false,
          message: "isFreeShipping can either be true or false",
        });
      update.isFreeShipping = isFreeShipping;
    }

    if (Object.hasOwn(req.body, "style")) {
      if (!isValid(style))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a style" });

      if (!isValidStyle(style))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid style" });
      update.style = style;
    }

    if (Object.hasOwn(req.body, "availableSizes")) {
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
      update["$addToSet"] = { "availableSizes": { $each: sizes } };
    }

    if (Object.hasOwn(req.body, "installments")) {
      if (typeof installments != "string" && typeof installments != "number")
        return res.status(400).send({
          status: false,
          message: "Please enter installments",
        });

      if (!/^[0-9]*$/.test(installments))
        return res.status(400).send({
          status: false,
          message: "Please enter valid number for installments",
        });

      update.installments = installments;
    }

    if (Object.hasOwn(req.body, "title")) {
      if (!isValid(title))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid title" });

      if (!isValidTitle(title))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid title" });

      title = removeSpaces(title);

      let checkTitle = await productModel.findOne({ title: title });

      if (checkTitle)
        return res.status(409).send({
          status: false,
          message: `'${title}' already present in Db`,
        });
      update.title = title;
    }

    let file = req.files;

    let allowedExtension = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];

    if (file && file.length > 0) {
      if (!allowedExtension.includes(file[0].mimetype))
        return res.status(400).send({
          status: false,
          message: "Image should be in required format",
        });

      let productImage = await uploadFile(file[0]);
      if (productImage.error)
        return res
          .status(400)
          .send({ status: false, message: productImage.error });
      update.productImage = productImage;
    }

    req.productUpdate = update;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createProductValidations,
  updateProductValidations,
  isValidTitle,
};
