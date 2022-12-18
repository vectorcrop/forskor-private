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
        (Role === "3" && Code == "cheif@123") ||
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

        console.log("Query ->", query);

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
    console.log(banner);
    db.get()
      .collection(collections.BANNER_COLLECTION)
      .insertOne(banner)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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

  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.BANNER_COLLECTION)
        .removeOne({ _id: objectId(bannerId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

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
    console.log(category);
    // category.Price = parseInt(category.Price);
    db.get()
      .collection(collections.CAT_COLLECTION)
      .insertOne(category)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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
    console.log(subcategory);
    // subcategory.Price = parseInt(subcategory.Price);
    db.get()
      .collection(collections.SUB_CAT_COLLECTION)
      .insertOne(subcategory)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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
    console.log(product);
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne(product)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      console.log(productDetails.ParentCat);
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
    console.log(combo);
    combo.Price = parseInt(combo.Price);
    db.get()
      .collection(collections.COMBO_COLLECTION)
      .insertOne(combo)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

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

  deleteCombo: (comboId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMBO_COLLECTION)
        .removeOne({ _id: objectId(comboId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

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

  ///-------------OFFERS-------------------------------------///

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

  getSingleUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ _id: objectId(userId) });
      resolve(user);
    });
  },

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

  ///----------------------USER ORDERS--------------------------////
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
        resolve({
          message: `Order Status changed ${status}`,
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },

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
    console.log(details);
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
