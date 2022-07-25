const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose')
// function for string verification
const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (value.length == 0) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId)
}

// function for name verification
const isValidFname = function (name) {
  return /^[a-zA-Z .]{2,30}$/.test(name);
};

const isValidLname = function (name) {
  return /^[a-zA-Z]{2,30}$/.test(name);
};

// function for validating input request
const isValidRequest = function (data) {
  if (Object.keys(data).length == 0) return false;
  return true;
};

// function for mail verification
const isValidMail = function (v) {
  return /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(
    v
  );
};

// function for mobile verification
const isValidMobile = function (num) {
  return /^[6789]\d{9}$/.test(num);
};

// function for pincode verification
const isValidPincode = function (num) {
  return /^[1-9][0-9]{5}$/.test(num);
};

// function for password verification
const isValidPassword = function (pass) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pass);
};

const userValidation = async (req, res, next) => {
  try {
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let { fname, lname, email, phone, password } = req.body;

    if (!isValid(fname))
      return res
        .status(400)
        .send({ status: false, message: "Please enter fname" });

    if (!isValidFname(fname))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid fname" });

    if (!isValid(lname))
      return res
        .status(400)
        .send({ status: false, message: "Please enter lname" });

    if (!isValidLname(lname))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid lname" });

    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });

    if (!isValidMail(email))
      return res
        .status(400)
        .send({ status: false, message: `'${email}' is not a valid email` });

    if (!isValid(phone))
      return res
        .status(400)
        .send({ status: false, message: "Please enter phone number" });

    if (!isValidMobile(phone))
      return res
        .status(400)
        .send({
          status: false,
          message: `'${phone}' is not a valid Indian phone number`,
        });

    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Please enter a password" });

    if (!isValidPassword(password))
      return res
        .status(400)
        .send({
          status: false,
          message: `'${password}' is not a valid password`,
        });

    let bcrpytPassword = await bcrypt.hash(password, 10);

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

    if (!isValid(req.body["address.billing.pincode"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter billing pincode" });

    if (!isValidPincode(req.body["address.billing.pincode"]))
      return res
        .status(400)
        .send({
          status: false,
          message: "Please enter a valid billing pincode",
        });

    if (!isValid(req.body["address.billing.city"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter billing city" });

    if (!isValid(req.body["address.billing.street"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter billing street" });

    if (!isValid(req.body["address.shipping.pincode"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter shipping pincode" });

    if (!isValidPincode(req.body["address.shipping.pincode"]))
      return res
        .status(400)
        .send({
          status: false,
          message: "Please enter a valid shipping pincode",
        });

    if (!isValid(req.body["address.shipping.city"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter shipping city" });

    if (!isValid(req.body["address.shipping.street"]))
      return res
        .status(400)
        .send({ status: false, message: "Please enter shipping street" });

    if (
      req.body["address.shipping.city"] != req.body["address.billing.city"] &&
      req.body["address.shipping.pincode"] == req.body["address.billing.pincode"]
    )
      return res
        .status(400)
        .send({
          status: false,
          message: "Pincode is different for different cities",
        });

    let address = {
      shipping: {
        street: req.body["address.shipping.street"],
        city: req.body["address.shipping.city"],
        pincode: req.body["address.shipping.pincode"],
      },
      billing: {
        street: req.body["address.billing.street"],
        city: req.body["address.billing.city"],
        pincode: req.body["address.billing.pincode"],
      },
    };

    let unique = await userModel.findOne({
      $or: [{ email: email }, { password: bcrpytPassword }],
    });

    if (unique)
      return res
        .status(400)
        .send({ status: false, message: "Password or Email should be unique" });

    let data = {
      fname: fname,
      lname: lname,
      email: email,
      phone: phone,
      password: bcrpytPassword,
      address: address,
    };

    req.register = data;

    next();
  } catch (err) {}
};

module.exports = { userValidation };
module.exports = { isValid, isValidObjectId}