var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {
  ///------------------------ADMIN REG-------------------------////
  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      // you can change admin reg code in here
      const { Name, Email, Password, Role, Code } = adminData;
      if (
        (Role === "2" && Code == "casher@123") ||
        (Role === "3" && Code == "chef@123") ||
        (Role === "4" && Code == "dboy@123")
      ) {
        const encryptedPassword = await bcrypt.hash(Password, 10);
        db.get()
          .collection(collections.ADMIN_COLLECTION)
          .insertOne({
            Name,
            Email,
            Password: encryptedPassword,
            Role,
            Status: "Active",
          })
          .then((data) => {
            resolve(data.ops[0]);
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  ///------------------------ADMIN LOGIN-------------------------////
  doSignin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      const admin = await db
        .get()
        .collection(collections.ADMIN_COLLECTION)
        .findOne({ Email: adminData.Email });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            resolve({ admin, status: true });
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  ///------------------------ADMIN GET ID-------------------------////
  getAdminById: (adminId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!adminId) {
          return reject({
            message: "Invalid adminId",
          });
        }
        const admin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({ _id: objectId(adminId) });
        resolve({
          message: "Get admin",
          admin,
        });
      } catch (error) {
        reject({
          message: error.message,
        });
      }
    });
  },
  getShopStatus: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const settings = await db
          .get()
          .collection(collections.SETTINGS_COLLECTION)
          .findOne();
        resolve({
          shopStatus: settings ? settings.ShopStatus : "INACTIVE",
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  changeShopStatus: (status) => {
    return new Promise(async (resolve, reject) => {
      try {
        const shopStatus = status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
        const settings = await db
          .get()
          .collection(collections.SETTINGS_COLLECTION)
          .findOne();
        if (settings) {
          await db
            .get()
            .collection(collections.SETTINGS_COLLECTION)
            .updateOne(
              { _id: objectId(settings._id) },
              {
                $set: {
                  ShopStatus: shopStatus,
                },
              }
            );
          console.log(
            { _id: objectId(settings._id) },
            {
              ShopStatus: shopStatus,
            }
          );
        } else {
          await db.get().collection(collections.SETTINGS_COLLECTION).insertOne({
            ShopStatus: shopStatus,
          });
        }
        resolve({
          message: `Shop status changed to ${shopStatus}`,
          shopStatus,
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ///------------------------ADD ADMIN-------------------------////
  addAdmin: (adminRole, adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
        // you can change admin reg code in here
        const { Name, Email, Password, Role } = adminData;

        if (!Name || !Email || !Password || !Role) {
          return reject({
            message: "Provide Name, Email, Role and Password",
          });
        }

        const admin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({
            Email,
          });

        if (admin || adminRole != 1) {
          return reject({
            message: admin ? "Email already exist" : "Access Denied",
          });
        }

        const encryptedPassword = await bcrypt.hash(Password, 10);
        const data = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .insertOne({
            Name,
            Email,
            Password: encryptedPassword,
            Role,
            Status: "Active",
          });
        resolve({ message: "Admin added Successfully", admin: data.ops[0] });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },

  ///------------------------EDIT ADMIN-------------------------////
  editAdmin: (adminId, adminRole, adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
        // you can change admin reg code in here
        const { Name, Email, Password, IsPassword, Role } = adminData;

        if (!adminId || !Role || !Name || !Email || !Role) {
          return reject({
            message: "Provide Name, Email and Role",
          });
        }

        const admin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({
            _id: objectId(adminId),
          });

        const nadmin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({
            _id: { $ne: objectId(adminId) },
            Email,
          });
        if (!admin || adminRole != 1) {
          return reject({
            message: !admin ? "Invalid Admin" : "Access Denied",
          });
        }

        if (admin && nadmin && nadmin.Email === Email) {
          return reject({
            message: "Email already exist for other admin",
          });
        }

        console.log("IsPassword -> ", IsPassword, ",Password -> ", Password);
        const query =
          IsPassword === "1" && Password
            ? { Password: await bcrypt.hash(Password, 10) }
            : {};

        await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .updateOne(
            { _id: objectId(adminId) },
            {
              $set: {
                Name,
                Email,
                Role,
                ...query,
              },
            }
          );
        resolve({ message: "Admin edited Successfully" });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ///------------------------CHANGE ADMIN PASSWORD-------------------------////
  changeAdminPassword: (adminId, Role, Password) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!adminId || !Role || !Password) {
          return reject({
            message: "Provide Password",
          });
        }

        const admin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({
            _id: objectId(adminId),
          });

        if (!admin || Role != 1) {
          return reject({
            message: !admin ? "Invalid Id" : "Access Denied",
          });
        }

        const encryptedPassword = await bcrypt.hash(Password, 10);
        await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .updateOne(
            { _id: objectId(adminId) },
            {
              $set: {
                Password: encryptedPassword,
              },
            }
          );
        resolve({ message: "Admin password changed Successfully" });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ///------------------------CHANGE ADMIN STATUS-------------------------////
  changeAdminStatus: (adminId, Role, Status) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (
          !adminId ||
          !Role ||
          !Status ||
          (Status && Status != "Active" && Status != "Blocked")
        ) {
          return reject({
            message: "Provide valid Status",
          });
        }

        const admin = await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .findOne({
            _id: objectId(adminId),
          });

        if (!admin || Role != 1) {
          return reject({
            message: !admin ? "Invalid Id" : "Access Denied",
          });
        }
        await db
          .get()
          .collection(collections.ADMIN_COLLECTION)
          .updateOne(
            { _id: objectId(adminId) },
            {
              $set: {
                Status,
              },
            }
          );
        resolve({ message: "Admin status changed Successfully" });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ///------------------------GET ALL ADMINS-------------------------////
  getAllAdmins: () => {
    return new Promise(async (resolve, reject) => {
      let admins = await db
        .get()
        .collection(collections.ADMIN_COLLECTION)
        .find()
        .sort({ Status: 1 })
        .toArray();
      resolve(admins);
    });
  },

  ////-------------------BANNER------------------------------------///

  addBanner: (banner, callback) => {
    // console.log(banner);
    db.get()
      .collection(collections.BANNER_COLLECTION)
      .insertOne(banner)
      .then((data) => {
        // console.log(data);
        callback(data.ops[0]._id);
      });
  },
  ////------------------------GET ALL BANNERS-------------------------////
  getAllBanner: () => {
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collections.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banners);
    });
  },
  ////------------------------GET BANNER DETAILS-------------------------////
  getBannerDetails: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BANNER_COLLECTION)
        .findOne({ _id: objectId(bannerId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ////------------------------DELETE BANNER-------------------------////
  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BANNER_COLLECTION)
        .removeOne({ _id: objectId(bannerId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ////------------------------UPDATE BANNER-------------------------////
  updateBanner: (bannerId, bannerDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BANNER_COLLECTION)
        .updateOne(
          { _id: objectId(bannerId) },
          {
            $set: {
              Name: bannerDetails.Name,
              Sheading: bannerDetails.Sheading,
              Path: bannerDetails.Path,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  ////------------------------DELETE ALL BANNER-------------------------////
  deleteAllBanner: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BANNER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ////-------------------MAIN-CATGEORY------------------------------------///

  addMainCat: (maincat, callback) => {
    console.log(maincat);
    // maincat.Price = parseInt(maincat.Price);
    db.get()
      .collection(collections.MAIN_CAT_COLLECTION)
      .insertOne(maincat)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },
  ////------------------------GET ALL MAIN CATGEORY-------------------------////
  getAllMainCat: () => {
    return new Promise(async (resolve, reject) => {
      let maincat = await db
        .get()
        .collection(collections.MAIN_CAT_COLLECTION)
        .find()
        .toArray();
      resolve(maincat);
    });
  },
  ////------------------------GET MAIN CATGEORY DETAILS-------------------------////
  getMainCatDetails: (maincatId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MAIN_CAT_COLLECTION)
        .findOne({ _id: objectId(maincatId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  // deleteMaincat: (maincatId) => {
  //   return new Promise((resolve, reject) => {
  //     db.get()
  //       .collection(collections.MAIN_CAT_COLLECTION)
  //       .removeOne({ _id: objectId(maincatId) })
  //       .then((response) => {
  //         console.log(response);
  //         resolve(response);
  //       });
  //   });
  // },

  ////------------------------UPDATE MAIN CATGEORY-------------------------////
  updateMainCat: (maincatId, maincatDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.MAIN_CAT_COLLECTION)
        .updateOne(
          { _id: objectId(maincatId) },
          {
            $set: {
              Name: maincatDetails.Name,
              ParentCat: maincatDetails.ParentCat,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  ////-------------------CATGEORY------------------------------------///

  addCategories: (category, callback) => {
    
    // category.Price = parseInt(category.Price);
    db.get()
      .collection(collections.CAT_COLLECTION)
      .insertOne(category)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  ////------------------------GET ALL CATGEORY-------------------------////
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collections.CAT_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    });
  },
  ////------------------------GET CATGEORY DETAILS-------------------------////
  getCategoryDetails: (categoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CAT_COLLECTION)
        .findOne({ _id: objectId(categoryId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ////------------------------DELETE CATGEORY-------------------------////
  deleteCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CAT_COLLECTION)
        .removeOne({ _id: objectId(categoryId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  ////------------------------UPDATE CATGEORY-------------------------////
  updateCategory: (categoryId, categoryDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CAT_COLLECTION)
        .updateOne(
          { _id: objectId(categoryId) },
          {
            $set: {
              Name: categoryDetails.Name,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  ////------------------------DELETE ALL CATGEORY-------------------------////
  deleteAllCategory: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CAT_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ////-------------------SUB-CATGEORY------------------------------------///

  addSubCategories: (subcategory, callback) => {

    // subcategory.Price = parseInt(subcategory.Price);
    db.get()
      .collection(collections.SUB_CAT_COLLECTION)
      .insertOne(subcategory)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  ////------------------------GET ALL SUB CATGEORY-------------------------////
  getAllSubCategories: () => {
    return new Promise(async (resolve, reject) => {
      let subcategory = await db
        .get()
        .collection(collections.SUB_CAT_COLLECTION)
        .find()
        .toArray();
      resolve(subcategory);
    });
  },
  ////------------------------GET SUB CATGEORY DETAILS-------------------------////
  getSubCategoryDetails: (subcategoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SUB_CAT_COLLECTION)
        .findOne({ _id: objectId(subcategoryId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ////------------------------DELETE SUB CATGEORY-------------------------////
  deleteSubCategory: (subcategoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SUB_CAT_COLLECTION)
        .removeOne({ _id: objectId(subcategoryId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  ////------------------------UPDATE SUB CATGEORY-------------------------////
  updateSubCategory: (subcategoryId, subcategoryDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SUB_CAT_COLLECTION)
        .updateOne(
          { _id: objectId(subcategoryId) },
          {
            $set: {
              Name: subcategoryDetails.Name,
              ParentCat: subcategoryDetails.ParentCat,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  ////------------------------DELETE ALL SUB CATGEORY-------------------------////
  deleteAllSubCategory: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SUB_CAT_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ///-------------ITEMS-------------------------------------///

  addProduct: (product, callback) => {
    // console.log(product);
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne(product)
      .then((data) => {
        // console.log(data);
        callback(data.ops[0]._id);
      });
  },
  ///------------------------GET ALL PRODUCTS-------------------------///
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  ///------------------------GET PRODUCT DETAILS-------------------------///
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ///------------------------DELETE PRODUCT-------------------------///
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          // console.log(response);
          resolve(response);
        });
    });
  },
  ///------------------------UPDATE PRODUCT-------------------------///
  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      // console.log(productDetails.ParentCat);
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Offer: productDetails.Offer,
              ParentCat: productDetails.ParentCat,
              Type: productDetails.Type,
              Price: productDetails.Price,
              Visibility: productDetails.Visibility,
              Description: productDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  ///------------------------DELETE ALL PRODUCTS-------------------------///
  deleteAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ///-------------COMBO OFFERS-------------------------------------///

  addCombo: (combo, callback) => {
    // console.log(combo);
    combo.Price = parseInt(combo.Price);
    db.get()
      .collection(collections.COMBO_COLLECTION)
      .insertOne(combo)
      .then((data) => {
        // console.log(data);
        callback(data.ops[0]._id);
      });
  },
  ///------------------------GET ALL COMBOS-------------------------///
  getAllCombos: () => {
    return new Promise(async (resolve, reject) => {
      let combos = await db
        .get()
        .collection(collections.COMBO_COLLECTION)
        .find()
        .toArray();
      resolve(combos);
    });
  },
  ///------------------------GET COMBO DETAILS-------------------------///
  getComboDetails: (comboId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMBO_COLLECTION)
        .findOne({ _id: objectId(comboId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ///------------------------DELETE COMBO-------------------------///
  deleteCombo: (comboId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMBO_COLLECTION)
        .removeOne({ _id: objectId(comboId) })
        .then((response) => {
          // console.log(response);
          resolve(response);
        });
    });
  },
  ///------------------------UPDATE COMBO-------------------------///
  updateCombo: (comboId, comboDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMBO_COLLECTION)
        .updateOne(
          { _id: objectId(comboId) },
          {
            $set: {
              Name: comboDetails.Name,
              Offer: comboDetails.Offer,
              Category: comboDetails.Category,
              Price: comboDetails.Price,
              Description: comboDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  ///------------------------DELETE ALL COMBOS-------------------------///
  deleteAllCombos: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMBO_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ///------------------------OFFERS-------------------------///

  addOffer: (offer, callback) => {
    console.log(offer);
    offer.Price = parseInt(offer.Price);
    db.get()
      .collection(collections.OFFERS_COLLECTION)
      .insertOne(offer)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },
  ///------------------------GET ALL OFFERS-------------------------///
  getAllOffers: () => {
    return new Promise(async (resolve, reject) => {
      let offers = await db
        .get()
        .collection(collections.OFFERS_COLLECTION)
        .find()
        .toArray();
      resolve(offers);
    });
  },
  ///------------------------GET OFFER DETAILS-------------------------///
  getOfferDetails: (offerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.OFFERS_COLLECTION)
        .findOne({ _id: objectId(offerId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  ///------------------------DELETE OFFER-------------------------///
  deleteOffer: (offerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.OFFERS_COLLECTION)
        .removeOne({ _id: objectId(offerId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  ///------------------------UPDATE OFFER-------------------------///
  updateOffer: (offerId, offerDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.OFFERS_COLLECTION)
        .updateOne(
          { _id: objectId(offerId) },
          {
            $set: {
              Name: offerDetails.Name,
              Offer: offerDetails.Offer,
              Category: offerDetails.Category,
              Price: offerDetails.Price,
              Description: offerDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve({ message: "Successfully Updated" });
        });
    });
  },
  ///------------------------DELETE ALL OFFERS-------------------------///
  deleteAlloffer: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.OFFERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ///---------------------------USERS-----------------------------///
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  ///------------------------GET SINGLE USER-------------------------///
  getSingleUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ _id: objectId(userId) });
      resolve(user);
    });
  },
  ///------------------------DELETE USER-------------------------///
  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve({ message: "User Removed successfully" });
        });
    });
  },
  ///------------------------DELETE ADMIN-------------------------///
  removeAdmin: (adminId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ADMIN_COLLECTION)
        .removeOne({ _id: objectId(adminId) })
        .then(() => {
          resolve({ message: "Admin Removed successfully" });
        });
    });
  },
  ///------------------------DELETE ALL USERS-------------------------///
  removeAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ///----------------------USER ORDERS--------------------------///
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },
  parseDate: (dateString) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month}-${day}`);
  },
  getAllOrdersReport: (from, to) => {
    return new Promise(async (resolve, reject) => {
      try {
        //* Convert 'from' and 'to' dates to compatible formats*//
        //note for gokul---------------------------------------///////
        //parsedate to this.parseDate is also not working          //
        //const fromDate = new Date(module.exports.parseDate(from)//
        // no need to convert in this senariao                 ////
        //----------------------------------------------------////
        const fromDate = new Date(from); 
        fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
        const toDate = new Date(to);                                                  
        toDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

        const orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
           // status:'delivered'
          })
          .toArray();
        resolve(orders);
      } catch (error) {
        reject({
          message: error.message,
        });
      }
    });
  },
  //gst report
  getAllOrdersGstReport: (from, to) => { // alreport
    return new Promise(async (resolve, reject) => {
      try {
        //* Convert 'from' and 'to' dates to compatible formats*//
        //note for gokul---------------------------------------///////
        //parsedate to this.parseDate is also not working          //
        //const fromDate = new Date(module.exports.parseDate(from)//
        // no need to convert in this senariao                 ////
        //----------------------------------------------------////
        const fromDate = new Date(from); 
        fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
        const toDate = new Date(to);                                                  
        toDate.setHours(23, 59, 59, 999); // Set time to 23:59:59.999

        const orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({
            createdAt: {
              $gte: fromDate,
              $lte: toDate,
            },
           // status:'delivered'
          })
          .toArray();
        resolve(orders);
      } catch (error) {
        reject({
          message: error.message,
        });
      }
    });
  },
  ///------------------------GET ORDER BY STATUS-------------------------///
  getOrdersByStatus: (status, sort = 1) => {
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({ status: { $in: status } })
          .sort({ createdAt: sort })
          .toArray();
        resolve({ message: "Orders Fetched", orders });
      } catch (error) {
        reject({
          message: error.message,
        });
      }
    });
  },
  ///------------------------CHANGE ORDER STATUS-------------------------///
  changeStatus: (status, orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!orderId) {
          reject({
            message: "Invalid OrderId",
          });
        }

        const order = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) });

        if (!order) {
          return reject({
            message: "Order not found",
          });
        }
        const modifiedOrderItems = order.products.map((product) => {
          if (product.status != "cancelled") {
            product.status = status;
          }
          return product;
        });

        const query =
          status === "cancelled" ? { reason: "Cancelled by admin " } : {};

        await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                products: modifiedOrderItems,
                status: status,
                ...query,
              },
            }
          );
        const norder = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) });

        resolve({
          message: `Order Status changed ${status}`,
          order: norder,
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ///------------------------CANCEL ORDER-------------------------///
  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },
  ///------------------------CANCEL ALL ORDERS-------------------------///
  cancelAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  ////----------------SEARCH--------------------------////
  searchProduct: (details) => {
    // console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" })
        .then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        });
    });
  },
};
