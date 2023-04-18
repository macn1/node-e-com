const { response } = require("express");
var express = require("express");
const { ObjectId } = require("mongodb");
const { CART_COLLECTION } = require("../config/collections");
const productHelpers = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helper");
const cartHelpers = require("../helpers/cart-helper");
var router = express.Router();
var objectId = require("mongodb").ObjectId;

const accountSid = "ACe972ef06a0aad73c1d10824e1dadfab4";
const authToken = "4421adc5991cec5facc8c20946348cf5";
const client = require("twilio")(accountSid, authToken);

const verifyLogin = (req,res,next)=>{
  if (req.session.user) {
    next()
  }
  res.redirect('/signin')
}

/* GET home page. */
router.get("/", async function (req, res, next) {
  let cartCount = null;
  let user = req.session.user;
  console.log(user);
  if (user) {
    let cartCount = await cartHelpers.getCartCount(req.session.user._id)

    // console.log(cartCount,"cfsgahjchcshajsccb");
    res.render("user/view-products", { user,cartCount});
  }

  res.render("user/view-products", { user });
});
router.get("/signin", function (req, res, next) {
  if (req.session.logedIn) {
    res.redirect("/");
  } else {
    res.render("user/signin", { login_Err: req.session.loginErr });
    req.session.loginErr = false;
  }
});
router.get("/signup", (req, res) => {
  // console.log(req.session.signupData,"ggggggggggggggggggggggg");
  if (req.session.signupData) {
    res.render("user/signup", { message: req.session.signupData });
    req.session.signupData = false;
  } else {
    res.render("user/signup");
  }
});

router.post("/signup", (req, res) => {
  if (!(req.body.Confirm == req.body.Password)) {
    req.session.signupData = "password doesn't match";

    res.redirect("/signup");
  } else {
    // console.log(req.body);
    userHelper.doEmailcheck(req.body.Email).then((data) => {
      if (data) {
        req.session.signupData = "email is already exist";

        res.redirect("/signup");
      } else {
        userHelper.doVerify(req.body.Phone).then((data) => {
          if (data.status) {
            req.session.signupData = "phone is already exist";

            res.redirect("/signup");
          } else {
            userHelper.doSignup(req.body).then((response) => {
              //  console.log(response);
            });

            res.redirect("/signin");
          }
        });
      }
    });
  }
});

router.post("/signin", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    // console.log("hekkkooo");
    // console.log(response,'sssssssssssssssss');
    if (response.status) {
      // console.log("asdfghjk");
      req.session.logedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "invalid username or password";
      res.redirect("/signin");
    }
  });
});
router.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/otp", (req, res) => {
  if (req.session.variable) {
    res.render("user/otp", { variable: req.session.variable });
    req.session.variable = false;
  } else {
    res.render("user/otp");
  }
});
router.post("/otp", (req, res) => {
  userHelper.doVerify(req.body.number).then((data) => {
    if (data.status) {
      console.log(data);

      const num = req.body.number;
      req.session.number = num;
      client.verify.v2
        .services("VA3a999b62815d1effc306679f65b37aab")
        .verifications.create({ to: `+91${num}`, channel: "sms" })
        .then((verification_check) => res.redirect("/otpVerify"));

      req.session.user = data.number;
      req.session.number = num;
    } else {
      req.session.variable = "this phone is not registerd";
      res.redirect("/otp");
    }
  });
});

router.get("/otpVerify", (req, res) => {
  res.render("user/otpVerify");
});
router.post("/otpVerify", (req, res) => {
  const otp = req.body.otp;
  console.log(otp, "kkkkkkkkkkkkk", req.session.number);
  client.verify.v2
    .services("VA3a999b62815d1effc306679f65b37aab")
    .verificationChecks.create({
      to: `+91${req.session.user.Phone}`,
      code: otp,
    })
    .then((verification_check) => {
      if ((verification_check.status = "aproved")) {
        req.session.logedIn = true;
        res.redirect("/");
      }
    });
});
router.get("/shop", async (req, res) => {
  let cartCount = await cartHelpers.getCartCount(req.session.user._id);

  productHelpers.getProduct().then((products) => {
    // console.log(products);

    let user = req.session.user;

    res.render("user/shop", { user, products,cartCount });
  });
});



router.get("/add-to-cart/:id", (req, res) => {
  // console.log(req.session.user);
  console.log("api call");
  console.log(req.session.user);
  cartHelpers.addtoCart(req.params.id, req.session.user._id).then(() => {
      res.json({status:true})
    // res.redirect('/shop')
  }
);
}); 
router.get("/cart", async (req, res) => {
  // let user = req.session.user
  let cartCount = await cartHelpers.getCartCount(req.session.user._id)
  let total = await cartHelpers.getTotalAmount(req.session.user._id)
  console.log(total,'dddd');

 let products =  await cartHelpers.getCartProduct(req.session.user._id)
// console.log(products);
  res.render("user/cart",{products,user:req.session.user._id,total,cartCount});
});

router.post('/change-product-quantity',(req,res)=>{
  
  // console.log(req.body); 
  cartHelpers.changeProductQuantity(req.body).then(async(response)=>{

    response.total=await cartHelpers.getTotalAmount(req.body.user)
    console.log(response);
    res.json(response)

  })
})
router.post('/delete-cart-product/',(req,res)=>{
  // console.log(req.body);
  cartHelpers.removeProduct(req.body).then((response)=>{
    // console.log(response);
    res.json(response)
  })

})
router.get('/place-order',async(req,res)=>{
let user= req.session.user
  let total = await cartHelpers.getTotalAmount(req.session.user._id)
  // console.log(total);
  res.render('user/place',{user,total})
})


module.exports = router;
