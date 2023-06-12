// Description: This file contains all the routes for admin
var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
const { ADMIN_ID_KEY } = require("../config/constant").COOKIE_KEYS;

// Verify as admin
const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/bigwig/signin");
  }
};

// Router For Casher
router.get("/casher", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/home", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// Router For Banners
router.get("/all-banner", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllBanner().then((banners) => {
    res.render("admin/all-banner", {
      layout: "layout3",
      admin: true,
      banners,
      administator,
    });
  });
});

// Router For reports
router.get("/reports", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/reports", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// Router For single-report
router.get("/single-report", verifySignedIn, function (req, res) {
  console.log(req.body);
  let administator = req.session.admin;
  res.render("admin/single-report", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// Router For Report
router.patch("/report", verifySignedIn, (req, res) => {
  adminHelper
    .getAllOrdersReport(req.body.from, req.body.to)
    .then((orders) => {
      res.status(200).json({
        success: true,
        message: "Report generated",
        data: orders,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    });
});

// Router For Chef
router.get("/chef", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/chef", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// Router For deliveryboy
router.get("/deliveryboy", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/deliveryboy", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// Router For All Non-veg/Veg
router.get("/all-maincat", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllMainCat().then((maincat) => {
    res.render("admin/all-maincat", {
      layout: "layout3",
      admin: true,
      maincat,
      administator,
    });
  });
});

// Router For All Category
router.get("/all-category", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllCategories().then((category) => {
    res.render("admin/all-category", {
      layout: "layout3",
      admin: true,
      category,
      administator,
    });
  });
});

// Router For all sub-Category
router.get("/all-sub-category", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllSubCategories().then((subcategory) => {
    res.render("admin/all-sub-category", {
      layout: "layout3",
      admin: true,
      subcategory,
      administator,
    });
  });
});

// Router For Sub-Category
router.get("/all-sub-category", function (req, res) {
  res.render("admin/all-sub-category", {
    layout: "layout3",
    admin: true,
    signUpErr: req.session.signUpErr,
    administator,
  });
});

// admin home
router.get("/", verifySignedIn, async (req, res, next) => {
  try {
    const administator = req.session.admin;
    if (administator.Role === "1" || administator.Role === "2") {
      const response = await adminHelper.getOrdersByStatus(
        ["placed", "confirmed", "cooking", "packed"],
        1
      );
      const shopStatusResp = await adminHelper.getShopStatus();
      return res.render("admin/home", {
        layout: "layout3",
        admin: true,
        signUpErr: req.session.signUpErr,
        administator,
        placedOrdersCount: response.orders.length,
        shopStatus: shopStatusResp.shopStatus === "ACTIVE",
        // productsCount: response.products.length,
      });
    }
    if (administator.Role === "3") {
      const response = await adminHelper.getOrdersByStatus(
        ["confirmed", "cooking", "packed"],
        1
      );
      return res.render("admin/chef", {
        layout: "layout3",
        admin: true,
        signUpErr: req.session.signUpErr,
        administator,
        orders: response.orders,
        cookingOrdersCount: response.orders.length,
      });
    }
    if (administator.Role === "4") {
      const response = await adminHelper.getOrdersByStatus(
        ["dispatched", "picked"],
        1
      );
      return res.render("admin/deliveryboy", {
        layout: "layout3",
        admin: true,
        signUpErr: req.session.signUpErr,
        administator,
        orders: response.orders,
        deliveryOrdersCount: response.orders.length,
      });
    }
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

// item view page
router.get("/all-products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  // if (administator.Role != "1") {
  //   req.session.signedInAdmin = false;
  //   req.session.admin = null;
  //   return res.redirect("/bigwig/login");
  // }
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", {
      layout: "layout3",
      admin: true,
      products,
      administator,
    });
  });
});

// item view page
router.get("/products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  // if (administator.Role != "1") {
  //   req.session.signedInAdmin = false;
  //   req.session.admin = null;
  //   return res.redirect("/bigwig/login");
  // }
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", {
      layout: "layout3",
      admin: true,
      products,
      administator,
    });
  });
});

// Combos view page
router.get("/all-combo", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllCombos().then((combos) => {
    res.render("admin/all-combo", {
      layout: "layout3",
      admin: true,
      combos,
      administator,
    });
  });
});

// Offers view page
router.get("/all-offers", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllOffers().then((offers) => {
    res.render("admin/all-offers", {
      layout: "layout3",
      admin: true,
      offers,
      administator,
    });
  });
});

router.get("/all-admins", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllAdmins().then((admins) => {
    res.render("admin/all-admins", {
      layout: "layout3",
      admin: true,
      administator,
      admins,
      errorMsg: req.session.errorMsg,
      successMsg: req.session.successMsg,
    });
    req.session.errorMsg = null;
    req.session.successMsg = null;
  });
});

router.patch("/change-shop-status", verifySignedIn, async (req, res) => {
  const shopStatusResp = await adminHelper.changeShopStatus(req.body.status);

  res.json({
    success: true,
    shopStatus: shopStatusResp.shopStatus,
  });
});

// add admin
router.get("/add-admin", verifySignedIn, function (req, res) {
  res.render("admin/add-admin", {
    layout: "layout3",
    admin: true,
    addAdminErr: req.session.addAdminErr,
  });
  req.session.addAdminErr = null;
});

// signup admin verification
router.post("/add-admin", verifySignedIn, function (req, res) {
  adminHelper
    .addAdmin(req.session.admin.Role, req.body)
    .then((response) => {
      req.session.successMsg = response.message;
      res.redirect("/bigwig/all-admins");
    })
    .catch((error) => {
      req.session.addAdminErr = error.message;
      res.redirect("/bigwig/add-admin");
    });
});

// edit admin
router.get("/edit-admin/:id", verifySignedIn, function (req, res) {
  adminHelper
    .getAdminById(req.params.id)
    .then((resp) => {
      res.render("admin/edit-admin", {
        layout: "layout3",
        admin: true,
        editAdminErr: req.session.editAdminErr,
        adminDetails: resp.admin,
        adminId: req.params.id,
      });
      req.session.editAdminErr = null;
    })
    .catch((error) => {
      req.session.errorMsg = error.message;
      res.redirect("/bigwig/all-admins");
    });
});

// edit admin details
router.post("/edit-admin/:id", verifySignedIn, function (req, res) {
  console.log(req.body);
  adminHelper
    .editAdmin(req.params.id, req.session.admin.Role, req.body)
    .then((response) => {
      req.session.successMsg = response.message;
      res.redirect("/bigwig/all-admins");
    })
    .catch((error) => {
      req.session.editAdminErr = error.message;
      res.redirect(`/bigwig/edit-admin/${req.params.id}`);
    });
});

// admin signin
router.get("/signin", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/bigwig");
  } else {
    res.render("admin/signin", {
      layout: "adminlayout",
      admin: true,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

// signin admin verification
router.post("/signin", function (req, res) {
  adminHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInAdmin = true;
      req.session.admin = response.admin;
      res.cookie(ADMIN_ID_KEY, response.admin._id, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
      });
      res.redirect("/bigwig");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/bigwig/signin");
    }
  });
});

// signout
router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.clearCookie(ADMIN_ID_KEY);
  res.redirect("/bigwig");
});

///---------------BANNER---------------------------------///
// add combo page
router.get("/add-banner", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  banners = await adminHelper.getAllBanner();
  res.render("admin/add-banner", {
    layout: "layout3",
    admin: true,
    administator,
    banners,
  });
  console.log(administator.Role);
});

// add banner validation
router.post("/add-banner", function (req, res) {
  adminHelper.addBanner(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/banner-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-banner");
      } else {
        console.log(err);
      }
    });
  });
});

// edit banner
router.get("/edit-banner/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let bannerId = req.params.id;
  let banner = await adminHelper.getBannerDetails(bannerId);
  console.log(banner);
  res.render("admin/edit-banner", {
    // layout: "layout3",
    admin: true,
    banner,
    administator,
  });
});

// edit banner validation
router.post("/edit-banner/:id", verifySignedIn, function (req, res) {
  let bannerId = req.params.id;
  adminHelper.updateBanner(bannerId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/banner-images/" + bannerId + ".png");
      }
    }
    res.redirect("/bigwig/all-banner");
  });
});

// delete products
router.get("/delete-banner/:id", verifySignedIn, function (req, res) {
  let bannerId = req.params.id;
  adminHelper.deleteAllBanner(bannerId).then((response) => {
    fs.unlinkSync("./public/images/banner-images/" + bannerId + ".png");
    res.redirect("/bigwig/all-banner");
  });
});

// delete all Banner
router.get("/delete-all-banner", verifySignedIn, function (req, res) {
  adminHelper.deleteAllbanner().then(() => {
    res.redirect("/bigwig/all-banner");
  });
});

///---------------OFFERS---------------------------------///
// add combo page
router.get("/add-offer", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  offers = await adminHelper.getAllOffers();
  res.render("admin/add-offers", {
    layout: "layout3",
    admin: true,
    administator,
    offers,
  });
});

// add offer validation
router.post("/add-offer", function (req, res) {
  adminHelper.addOffer(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/offer-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-offers");
      } else {
        console.log(err);
      }
    });
  });
});

// edit offer
router.get("/edit-offer/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let offerId = req.params.id;
  let offer = await adminHelper.getofferDetails(offerId);
  console.log(offer);
  res.render("admin/edit-offer", {
    // layout: "layout3",
    admin: true,
    offer,
    administator,
  });
});

// edit offer validation
router.post("/edit-offer/:id", verifySignedIn, function (req, res) {
  let offerId = req.params.id;
  adminHelper.updateoffer(offerId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/offer-images/" + offerId + ".png");
      }
    }
    res.redirect("/bigwig/all-offers");
  });
});

// delete products
router.get("/delete-offer/:id", verifySignedIn, function (req, res) {
  let offerId = req.params.id;
  adminHelper.deleteAlloffer(offerId).then((response) => {
    fs.unlinkSync("./public/images/offer-images/" + offerId + ".png");
    res.redirect("/bigwig/all-offers");
  });
});

// delete all products
router.get("/delete-all-offer", verifySignedIn, function (req, res) {
  adminHelper.deleteAlloffer().then(() => {
    res.redirect("/bigwig/all-offers");
  });
});

///---------------COMBO-OFFERS---------------------------------///
// add combo page
router.get("/add-combo", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  category = await adminHelper.getAllCategories();
  res.render("admin/add-combo", {
    layout: "layout3",
    admin: true,
    administator,
    category,
  });
});

// add combo validation
router.post("/add-combo", function (req, res) {
  adminHelper.addCombo(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/combo-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-combo");
      } else {
        console.log(err);
      }
    });
  });
});

// edit combo
router.get("/edit-combo/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let comboId = req.params.id;
  let combo = await adminHelper.getComboDetails(comboId);
  console.log(combo);
  res.render("admin/edit-combo", {
    // layout: "layout3",
    admin: true,
    combo,
    administator,
  });
});

// edit combo validation
router.post("/edit-combo/:id", verifySignedIn, function (req, res) {
  let comboId = req.params.id;
  adminHelper.updateCombo(comboId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/combo-images/" + comboId + ".png");
      }
    }
    res.redirect("/bigwig/all-combos");
  });
});

// delete products
router.get("/delete-combo/:id", verifySignedIn, function (req, res) {
  let comboId = req.params.id;
  adminHelper.deleteAllCombos(comboId).then((response) => {
    fs.unlinkSync("./public/images/combo-images/" + comboId + ".png");
    res.redirect("/bigwig/all-combo");
  });
});

// delete all products
router.get("/delete-all-combo", verifySignedIn, function (req, res) {
  adminHelper.deleteAllCombos().then(() => {
    res.redirect("/bigwig/all-combo");
  });
});

///---------------ITEM---------------------------------///
// add product page
router.get("/add-product", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  category = await adminHelper.getAllCategories();
  res.render("admin/add-product", {
    layout: "layout3",
    admin: true,
    administator,
    category,
  });
});

// add product validation
router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-products");
      } else {
        console.log(err);
      }
    });
  });
});

// edit products
router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  category = await adminHelper.getAllCategories();
  console.log(product);
  res.render("admin/edit-product", {
    // layout: "layout3",
    admin: true,
    product,
    administator,
    category,
  });
});

// edit products validation
router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  category = adminHelper.getAllCategories();
  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/bigwig/all-products");
  });
});

// delete products
router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/bigwig/all-products");
  });
});

// delete all products
router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/bigwig/all-products");
  });
});

////---------------------MAIN-CATEGORY-------------------------------////
// add category page
router.get("/add-maincat", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-maincat", {
    layout: "layout3",
    admin: true,
    administator,
  });
});

// add main category validation
router.post("/add-maincat", function (req, res) {
  adminHelper.addMainCat(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/maincat-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-maincat");
      } else {
        console.log(err);
      }
    });
  });
});

// edit products
router.get("/edit-maincat/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let maincatId = req.params.id;
  let maincat = await adminHelper.getMainCatDetails(maincatId);
  console.log(maincat);
  res.render("admin/edit-maincat", {
    // layout: "layout3",
    admin: true,
    maincat,
    administator,
  });
});

// edit category validation
router.post("/edit-maincat/:id", verifySignedIn, function (req, res) {
  let maincatId = req.params.id;
  adminHelper.updateMainCat(maincatId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/maincat-images/" + maincatId + ".png");
      }
    }
    res.redirect("/bigwig/all-maincat");
  });
});

////---------------------CATEGORY-------------------------------////
// add category page
router.get("/add-category", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-category", {
    layout: "layout3",
    admin: true,
    administator,
  });
});

// add category validation
router.post("/add-category", function (req, res) {
  adminHelper.addCategories(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/category-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/bigwig/all-category");
      } else {
        console.log(err);
      }
    });
  });
});

// edit products
router.get("/edit-category/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let categoryId = req.params.id;
  let category = await adminHelper.getCategoryDetails(categoryId);
  console.log(category);
  res.render("admin/edit-category", {
    // layout: "layout3",
    admin: true,
    category,
    administator,
  });
});

// edit category validation
router.post("/edit-category/:id", verifySignedIn, function (req, res) {
  let categoryId = req.params.id;
  adminHelper.updateCategory(categoryId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/category-images/" + categoryId + ".png");
      }
    }
    res.redirect("/bigwig/all-category");
  });
});

// delete category
router.get("/delete-category/:id", verifySignedIn, function (req, res) {
  let categoryId = req.params.id;
  adminHelper.deleteCategory(categoryId).then((response) => {
    fs.unlinkSync("./public/images/category-images/" + categoryId + ".png");
    res.redirect("/bigwig/all-category");
  });
});

// delete all category
router.get("/delete-all-category", verifySignedIn, function (req, res) {
  adminHelper.deleteAllCategory().then(() => {
    res.redirect("/bigwig/all-category");
  });
});

////---------------------SUB-CATEFORY-------------------------------////
// add category page
router.get("/add-sub-category", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  category = await adminHelper.getAllCategories();

  res.render("admin/add-sub-category", {
    layout: "layout3",
    admin: true,
    administator,
    category,
  });
});

// add sub-category validation
router.post("/add-sub-category", function (req, res) {
  adminHelper.addSubCategories(req.body, (id) => {
    let image = req.files.Image;
    image.mv(
      "./public/images/sub-category-images/" + id + ".png",
      (err, done) => {
        if (!err) {
          res.redirect("/bigwig/add-sub-category");
        } else {
          console.log(err);
        }
      }
    );
  });
});

// edit sub-category
router.get("/edit-sub-category/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let subcategoryId = req.params.id;
  let subcategory = await adminHelper.getSubCategoryDetails(subcategoryId);
  console.log(subcategory);
  res.render("admin/edit-category", {
    // layout: "layout3",
    admin: true,
    subcategory,
    administator,
  });
});

// edit category validation
router.post("/edit-sub-category/:id", verifySignedIn, function (req, res) {
  let subcategoryId = req.params.id;
  adminHelper.updateSubCategory(subcategoryId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv(
          "./public/images/sub-category-images/" + subcategoryId + ".png"
        );
      }
    }
    res.redirect("/bigwig/all-sub-category");
  });
});

// delete category
router.get("/delete-sub-category/:id", verifySignedIn, function (req, res) {
  let subcategoryId = req.params.id;
  adminHelper.deleteSubCategory(subcategoryId).then((response) => {
    fs.unlinkSync(
      "./public/images/sub-category-images/" + subcategoryId + ".png"
    );
    res.redirect("/bigwig/all-sub-category");
  });
});

// delete all category
router.get("/delete-all-sub-category", verifySignedIn, function (req, res) {
  adminHelper.deleteAllSubCategory().then(() => {
    res.redirect("/bigwig/all-sub-category");
  });
});

////--------------------USER------------------------/////
// all user page
router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/all-users", {
      layout: "layout3",
      admin: true,
      administator,
      users,
    });
  });
});

// remove single user
router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/bigwig/all-users");
  });
});

// remove single admin
router.get("/remove-admin/:id", verifySignedIn, function (req, res) {
  let adminId = req.params.id;
  adminHelper.removeAdmin(adminId).then((response) => {
    req.session.successMsg = response.message;
    res.redirect("/bigwig/all-admins");
  });
});

// remove all user
router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/bigwig/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  const administator = req.session.admin;
  const orders = await adminHelper.getAllOrders();
  console.log(orders);
  res.render("admin/all-orders", {
    layout: "layout3",
    admin: true,
    administator,
    orders,
  });
});

router.get("/placed-orders", verifySignedIn, async function (req, res) {
  const administator = req.session.admin;
  adminHelper
    .getOrdersByStatus(["placed", "confirmed", "cooking", "packed"], 1)
    .then((resp) => {
      res.render("admin/placed-orders", {
        layout: "layout3",
        admin: true,
        administator,
        orders: resp.orders,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/chef/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let orders = await adminHelper.getAllOrders(req.params.status);
  res.render("admin/all-orders", {
    layout: "layout3",
    admin: true,
    administator,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    const administator = req.session.admin;
    const orderId = req.params.id;
    const order = await userHelper.getOrderById(orderId);
    const products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true,
      administator,
      order,
      products,
    });
  }
);

// status changer
router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(({ order }) => {
    req.io.emit(`status-${status}`, order);
    req.io.emit(`status-changed`, { status, orderId });
    if (req.session.admin.Role === "3" || req.session.admin.Role === "4") {
      return res.redirect("/bigwig");
    }
    if (
      req.query.origin === "placed-orders" &&
      (req.session.admin.Role === "1" || req.session.admin.Role === "2")
    ) {
      return res.redirect("/bigwig/placed-orders");
    }
    if (req.session.admin.Role === "1" || req.session.admin.Role === "2") {
      return res.redirect("/bigwig/all-orders");
    }
    req.session.signedInAdmin = false;
    req.session.admin = null;
    res.redirect("/bigwig/login");
  });
});

// cancel single order
router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/bigwig/all-orders");
  });
});

// cancel all orders
router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/bigwig/all-orders");
  });
});

// search
router.post("/search-result", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", {
      layout: "layout3",
      admin: true,
      administator,
      response,
    });
  });
});

// export router
module.exports = router;
