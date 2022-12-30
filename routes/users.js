// Description: This file contains all the routes for the user side of the application
var express = require("express");
var userHelper = require("../helper/userHelper");
var router = express.Router();
const { ObjectID } = require("mongodb");
const { GUEST_ID_KEY, USER_ID_KEY } = require("../config/constant").COOKIE_KEYS;

///------------------THIS IS USER SIDE---------------------------///

// verify user
const verifySignedIn = async (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};

// user welcome page
router.get("/", async (req, res, next) => {
  res.render("users/welcome", { layout: "layout2", admin: false });
});

// Combo-offers page
router.get("/combo-offers", verifySignedIn, async (req, res, next) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/combo-offer", {
    admin: false,
    user,
    cartCount,
  });
});

// Offers Page
router.get("/offers", verifySignedIn, async (req, res, next) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  offers = await userHelper.getAllOffers();

  res.render("users/offers", {
    admin: false,
    user,
    cartCount,
    offers,
  });
});

// favoraite page
router.get("/fav", verifySignedIn, async (req, res, next) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/fav", { admin: false, user, cartCount });
});

//single product
router.get("/single-product/:id", async (req, res, next) => {
  let cartCount = 0;
  let user = null;
  if (req.session.user) {
    user = req.session.user;
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  let product = await userHelper
    .getSingleProducts(req.params.id.replace(":", ""))
    .then((response) => {
      var product = response[0];
      console.log(response[0].Name);
      res.render("users/single-product", {
        admin: false,
        back: true,
        product,
        user,
        cartCount,
      });
    });

  // let user = req.session.user;
  // let userId = req.session.user._id;
  // let cartCount = await userHelper.getCartCount();
});

// Profile page
router.get("/profile", verifySignedIn, async (req, res, next) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/profile", {
    admin: false,
    user,
    cartCount,
    back: true,
  });
});

// favoraite page
router.get("/menu", async (req, res, next) => {
  let cartCount = 0;
  let user = null;
  if (req.session.user) {
    user = req.session.user;
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  products = await userHelper.getAllProducts();
  maincat = await userHelper.getAllMainCat();
  category = await userHelper.getAllCategories();
  res.render("users/menu", {
    admin: false,
    user,
    back: true,
    cartCount,
    category,
    maincat,
    products,
  });
});

// favoraite page
router.get("/menu/:Name", async (req, res, next) => {
  let cartCount = 0;
  let user = null;
  if (req.session.user) {
    user = req.session.user;
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  products = await userHelper.getAllProducts();
  category = await userHelper.getAllCategories();
  maincat = await userHelper.getAllMainCat();
  res.render("users/menu", {
    admin: false,
    user,
    cartCount,
    category,
    maincat,
    products,
    catName: req.params.Name,
  });
});

// user home page
router.get("/home", async function (req, res, next) {
  let userId = req.session.signedIn
    ? req.session.user._id
    : req.cookies[GUEST_ID_KEY];

  if (!req.session.signedIn && !req.cookies[GUEST_ID_KEY]) {
    userId = new ObjectID().toString();
    res.cookie(GUEST_ID_KEY, userId);
  }

  const user = req.session.user;

  const cartCount = await userHelper.getCartCount(userId);
  const products = await userHelper.getAllProducts();
  const category = await userHelper.getAllCategories();
  const maincat = await userHelper.getAllMainCat();
  const banners = await userHelper.getAllBanner();

  // var shuffleproducts =
  // products.sort(() => Math.random() - 0.5);

  var limit20products = products.slice(0, 20);

  res.render("users/home", {
    admin: false,
    products,
    user,
    cartCount,
    limit20products,
    category,
    maincat,
    banners,
    signInSucc: req.session.signInSucc,
  });
  req.session.signInSucc = null;
});

// user signup
router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/home");
  } else {
    res.render("users/signup", {
      layout: "layout2",
      admin: false,
      signInErr: req.session.signInErr,
      tempFormData: req.session.tempFormData,
    });
    req.session.tempFormData = {
      firstName: null,
      lastName: null,
      phone: null,
      email: null,
      cose: null,
      address: null,
      place: null,
      pincode: null,
    };
  }
});

/**
 * Send otp to given phone if user exist
 */
router.post("/send-signup-otp", (req, res, next) => {
  const data = req.body;
  userHelper
    .sendOtp(data.phone, "sms", false)
    .then(({ message }) => {
      res.json({
        success: true,
        message,
      });
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
      });
    });
});

// signup a new user
router.post("/signup", async function (req, res) {
  const data = req.body;
  userHelper
    .doSignup(req.body)
    .then(async (response) => {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.cookie(USER_ID_KEY, response.user._id, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      res.cookie(USER_ID_KEY, response.user._id, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      if (req.cookies[GUEST_ID_KEY]) {
        await userHelper.addGuestCartItemsToUserCart(
          req.cookies[GUEST_ID_KEY],
          response.user._id
        );
        res.clearCookie(GUEST_ID_KEY);
      }
      req.session.signInSucc = response.message;
      res.redirect("/home");
    })
    .catch((error) => {
      req.session.signInErr = error.message;
      req.session.tempFormData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        code: data.code,
        address: data.address,
        place: data.place,
        pincode: data.pincode,
      };
      res.redirect("/signup");
    });
});

// if user already signed in then re-direct to home page else to signin
router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/home");
  } else {
    res.render("users/signin", {
      layout: "layout2",
      admin: false,
      signInErr: req.session.signInErr,
      signInSucc: req.session.signInSucc,
      signInType: req.session.signInType,
      otpSuc: req.session.otpSuc,
      phone: req.session.phone,
      email: req.session.email,
    });
    req.session.signInErr = null;
    req.session.signInSucc = null;
    req.session.otpSuc = null;
    req.session.email = null;
    req.session.phone = null;
  }
});

// user signin & Form validation
router.post("/signin", function (req, res) {
  const data = req.body;
  userHelper
    .doSignin(data)
    .then(async (response) => {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.cookie(USER_ID_KEY, response.user._id, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      if (req.cookies[GUEST_ID_KEY]) {
        await userHelper.addGuestCartItemsToUserCart(
          req.cookies[GUEST_ID_KEY],
          response.user._id
        );
        res.clearCookie(GUEST_ID_KEY);
      }
      req.session.signInSucc = response.message;
      res.redirect("/home");
    })
    .catch((error) => {
      req.session.signInErr = error.message;
      req.session.signInType = "PASSWORD";
      req.session.email = data.email;
      req.session.phone = data.phone;
      res.redirect("/signin");
    });
});

//
router.get("/reset-password", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/home");
  } else {
    res.render("users/reset-password", {
      layout: "layout2",
      admin: false,
      resetPasswdErr: req.session.resetPasswdErr,
      phone: req.session.phone,
    });
    req.session.resetPasswdErr = null;
    req.session.phone = null;
  }
});

//
router.post("/reset-password", async function (req, res) {
  userHelper
    .resetPassword(req.body)
    .then((response) => {
      req.session.otpSuc = response.message;
      res.redirect("/signin");
    })
    .catch((error) => {
      req.session.phone = req.body.phone;
      req.session.resetPasswdErr = error.message;
      res.redirect("/reset-password");
    });
});

/**
 * Send otp to given phone if user exist
 */
router.post("/send-otp", (req, res, next) => {
  const data = req.body;
  userHelper
    .sendOtp(data.phone, "sms")
    .then(({ message }) => {
      res.json({
        success: true,
        message,
      });
    })
    .catch((error) => {
      res.json({
        success: false,
        message: error.message,
      });
    });
});

/**
 * OTP verification for otp login
 */
router.post("/verify-otp", (req, res, next) => {
  const data = req.body;
  userHelper
    .doOtpLogin(data.phone, data.code)
    .then(async ({ message, user }) => {
      req.session.signedIn = true;
      req.session.user = user;
      res.cookie(USER_ID_KEY, user._id, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      if (req.cookies[GUEST_ID_KEY]) {
        await userHelper.addGuestCartItemsToUserCart(
          req.cookies[GUEST_ID_KEY],
          user._id
        );
        res.clearCookie(GUEST_ID_KEY);
      }
      req.session.signInSucc = message;
      res.redirect("/home");
    })
    .catch((error) => {
      req.session.signInErr = error.message;
      req.session.signInType = "OTP";
      req.session.email = data.email;
      req.session.phone = data.phone;
      res.redirect("/signin");
    });
});

// user signout
router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.clearCookie(USER_ID_KEY);
  res.redirect("/home");
});

// cart page
router.get("/cart", async function (req, res) {
  let userId = req.session.signedIn
    ? req.session.user._id
    : req.cookies[GUEST_ID_KEY];

  if (!req.session.signedIn && !req.cookies[GUEST_ID_KEY]) {
    userId = new ObjectID().toString();
    res.cookie(GUEST_ID_KEY, userId);
  }
  const user = req.session.user;
  const cartCount = await userHelper.getCartCount(userId);
  const cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render("users/cart", {
    admin: false,
    user,
    cartCount,
    cartProducts,
    total,
  });
});

// add to cart (id calling)
router.get("/add-to-cart/:id", function (req, res) {
  let userId = req.session.signedIn
    ? req.session.user._id
    : req.cookies[GUEST_ID_KEY];

  if (!req.session.signedIn && !req.cookies[GUEST_ID_KEY]) {
    userId = new ObjectID().toString();
    res.cookie(GUEST_ID_KEY, userId);
  }

  const productId = req.params.id;

  userHelper
    .addToCart(productId, userId)
    .then((response) => {
      res.json({ status: true, message: response.message });
    })
    .catch((error) => {
      return res.json({
        status: false,
        message: error.message,
        isLoggedIn,
      });
    });
});

// change product quantity (id calling)
router.post("/change-product-quantity", function (req, res) {
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

// remove cart items
router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

// to check a user is signed in for place an order
router.get("/place-order", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let total = await userHelper.getTotalAmount(userId);
  res.render("users/place-order", { admin: false, user, cartCount, total });
});

router.post("/place-order", verifySignedIn, async (req, res) => {
  const user = req.session.user;

  const cartCount = await userHelper.getCartCount(user._id);

  // Check cart is empty
  if (cartCount <= 0) {
    return res.json({
      success: false,
      message: "Order already placed! Keep shoping",
    });
  }

  const products = await userHelper.getCartProductList(user._id);
  const totalPrice = await userHelper.getTotalAmount(user._id);
  userHelper
    .placeOrder(req.body, products, totalPrice, user._id)
    .then((orderId) => {
      req.io.emit("status-placed", orderId);
      if (req.body["payment-method"] === "COD") {
        // res.redirect("/order-placed")
        return res.json({ success: true, message: "Order success" });
      }
      ///else {
      /// userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
      // return res.json({ success: true, message: "Order success", response });
      ///  });
      // }
    })
    .catch((error) => {
      return res.json({ success: false, message: "Order failed" });
    });
});

// payment  verification
router.post("/verify-payment", async (req, res) => {
  console.log(req.body);
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "Payment Failed" });
    });
});

router.get("/order-placed", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/order-placed", {
    admin: false,
    user,
    cartCount,
    orderCancErr: req.session.orderCancErr,
  });
  req.session.orderCancErr = null;
});

router.get("/orders", verifySignedIn, async function (req, res) {
  const user = req.session.user;
  const userId = req.session.user._id;
  const cartCount = await userHelper.getCartCount(userId);
  const orders = await userHelper.getUserOrder(userId);
  res.render("users/orders", {
    admin: false,
    user,
    cartCount,
    orders,
    orderCancErr: req.session.orderCancErr,
    orderCancSucc: req.session.orderCancSucc,
  });
  req.session.orderCancErr = null;
  req.session.orderCancSucc = null;
});

// view single items
router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    const user = req.session.user;
    const userId = req.session.user._id;
    const cartCount = await userHelper.getCartCount(userId);
    const orderId = req.params.id;
    const order = await userHelper.getOrderById(orderId);
    const products = await userHelper.getOrderProducts(orderId);
    res.render("users/order-products", {
      admin: false,
      user,
      cartCount,
      products,
      order,
      orderCancSucc: req.session.orderCancSucc,
      orderCancErr: req.session.orderCancErr,
    });
    req.session.orderCancErr = null;
    req.session.orderCancSucc = null;
  }
);

// cancel item
router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  userHelper
    .cancelOrder(orderId)
    .then((resp) => {
      req.io.emit(`status-cancelled`, orderId);
      req.session.orderCancSucc = resp.message;
      res.redirect("/orders");
    })
    .catch((error) => {
      req.session.orderCancErr = error.message;
      res.redirect("/orders");
    });
});

// cancel item
router.get("/cancel-order-item/:oid/:pid", verifySignedIn, function (req, res) {
  userHelper
    .cancelOrderItem(req.params.oid, req.params.pid)
    .then((resp) => {
      req.io.emit(`status-cancelled`, orderId);
      req.session.orderCancSucc = resp.message;
      res.redirect("/view-ordered-products/" + req.params.oid);
    })
    .catch((error) => {
      req.session.orderCancErr = error.message;
      res.redirect("/view-ordered-products/" + req.params.oid);
    });
});

//  search page
router.get("/search", async (req, res, next) => {
  let user = req.session.user || null;
  let userId;
  let cartCount = 0;
  if (user) {
    userId = req.session.user._id;
    cartCount = await userHelper.getCartCount(userId);
  }
  userHelper.getAllCategories().then((category) => {
    res.render("users/search", {
      admin: false,
      category,
      user,
      cartCount,
    });
  });
});

//search items
router.post("/search-result", async function (req, res) {
  let user = req.session.user || null;
  let userId;
  let cartCount = 0;
  if (user) {
    userId = req.session.user._id;
    cartCount = await userHelper.getCartCount(userId);
  }
  userHelper.searchProduct(req.body).then((response) => {
    res.render("users/search-result", {
      admin: false,
      user,
      cartCount,
      response,
    });
  });
});

// custom cat filter
router.get("/menus", async (req, res, next) => {
  let cartCount = 0;
  let user = null;
  if (req.session.user) {
    user = req.session.user;
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  category = await userHelper.getAllCategories();
  console.log(req.query.category);
  products = await userHelper.getSelectedProduct(req.query.category);

  // category = await userHelper.getAllCategories();
  res.render("users/menu", {
    admin: false,
    user,
    back: true,
    cartCount,
    category,
    products,
  });
});

// export router
module.exports = router;
