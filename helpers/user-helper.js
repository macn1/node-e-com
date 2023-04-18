var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const collections = require("../config/collections");
const { response } = require("express");
const Lookups = require("twilio/lib/rest/Lookups");
const { CART_COLLECTION } = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      delete userData.Confirm;

      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};

      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      // console.log(user);
      if (user) {
        console.log("hello");
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  doVerify: (userData) => {
    return new Promise(async (resolve, reject) => {
      let number = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Phone: userData });

      if (number) {
        console.log("phone number is valid", number);
        resolve({ number: number, status: true });
      } else {
        console.log("phone number is not registerd");
        resolve({ status: false });
      }
    });
  },
  doEmailcheck: (userData) => {
    return new Promise(async (resolve, reject) => {
      let emailCheck = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData });
      if (emailCheck) {
        console.log("the mail is already used");
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },
  
  
  getAllusers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USER_COLLECTION)
        .find()
        .toArray()
        .then((users) => {
          resolve(users);
        });
    });
  },
  
};
