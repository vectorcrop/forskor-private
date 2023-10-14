var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;
const moment = require("moment");
const { verifyOtp, sentOtp } = require("../utlis/twilio");
const { search } = require("../routes/users");

// const Razorpay = require("razorpay");

// var instance = new Razorpay({
//   key_id: "rzp_test_8NokNgt8cA3Hdv",
//   key_secret: "xPzG53EXxT8PKr34qT7CTFm9",
// });

module.exports = {
  ////////////////////////////Get All Products/////////////////////////////
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ Visibility: "Show" })
        .toArray();
      resolve(products);
    });
  },
  getAllProductsWithCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ Visibility: "Show" })
        .toArray();

      let updatedProducts = await Promise.all(
        products.map(async (product) => {
          let cart = await db
            .get()
            .collection(collections.CART_COLLECTION)
            .findOne({ user: objectId(userId), "products.item": product._id });
          product.CartId = cart ? cart._id : null;
          product.CartCount = cart
            ? cart.products.find(
                (cartProduct) =>
                  cartProduct.item.toString() === product._id.toString()
              ).quantity
            : 0;
          return product;
        })
      );
      resolve(updatedProducts);
    });
  },
  ////////////////////////////Get Single Products/////////////////////////////
  getSingleProducts: (pro) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ _id: objectId(pro) })
        .toArray();

      resolve(products);
    });
  },
  getSingleProductsWithCartCount: (pro, userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ _id: objectId(pro) })
        .toArray();

      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId), "products.item": products[0]._id });
      products[0].CartId = cart ? cart._id : null;
      products[0].CartCount = cart
        ? cart.products.find(
            (cartProduct) => cartProduct.item.toString() === pro.toString()
          ).quantity
        : 0;

      console.log(products);
      resolve(products);
    });
  },
  ////////////////////////////Get All Categories/////////////////////////////
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
  ////////////////////////////Get All Main Categories/////////////////////////////
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
  ////////////////////////////Get Selected Categories/////////////////////////////
  getSelectedProduct: (cat) => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ ParentCat: cat })
        .toArray();

      resolve(category);
    });
  },
  getSelectedProductWithCartCount: (cat, userId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({ ParentCat: cat })
        .toArray();
      let updatedProducts = await Promise.all(
        products.map(async (product) => {
          let cart = await db
            .get()
            .collection(collections.CART_COLLECTION)
            .findOne({ user: objectId(userId), "products.item": product._id });
          product.CartId = cart ? cart._id : null;
          product.CartCount = cart
            ? cart.products.find(
                (cartProduct) =>
                  cartProduct.item.toString() === product._id.toString()
              ).quantity
            : 0;
          return product;
        })
      );
      resolve(updatedProducts);
    });
  },
  ////////////////////////////Get All Banners/////////////////////////////
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
  ////////////////////////////Get All Offers/////////////////////////////
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
  ////////////////////////////Login/////////////////////////////
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          firstName,
          lastName,
          phone,
          code,
          email,
          place,
          pincode,
          password,
          address,
        } = userData;

        if (
          !firstName ||
          !lastName ||
          !phone ||
          !email ||
          !code ||
          !password ||
          !address ||
          !place ||
          !pincode
        ) {
          return reject({
            message:
              "Provide firstName, lastName, phone, email, verify code, password, place, pincode and address",
          });
        }

        const user = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .findOne({ $or: [{ phone }, { email }] });

        console.log(user);

        if (user) {
          return reject({
            message: "Account already exist",
          });
        }

        await verifyOtp(phone, code);

        const npassword = await bcrypt.hash(password, 10);
        const data = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .insertOne({
            firstName,
            lastName,
            phone,
            email,
            password: npassword,
            address,
            place,
            pincode,
          });

        resolve({ user: data.ops[0], message: "Welcome to Forskor" });
      } catch (error) {
        return reject({ message: error.message || "Server Error" });
      }
    });
  },
  ////////////////////////////Login/////////////////////////////
  doSignin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { email, password } = userData;

        if (!email || !password) {
          return reject({
            message: "Provide email and password",
          });
        }

        const user = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .findOne({ email: email });

        console.log(user, email, password);
        if (user) {
          const status = await bcrypt.compare(password, user.password);
          console.log(status);
          if (status) {
            return resolve({
              user,
              message: `Welcome Back ${user.firstName} ${user.lastName}`,
            });
          } else {
            return reject({ message: "Incorrect email (OR) password" });
          }
        } else {
          return reject({ message: "Incorrect email (OR) password" });
        }
      } catch (error) {
        return reject({ message: error.message || "Server Error" });
      }
    });
  },
  ////////////////////////////reset password/////////////////////////////
  resetPassword: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { phone, code, password } = userData;

        if (!phone || !code || !password) {
          return reject({
            message: "Provide phone, verify code and password",
          });
        }

        const user = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .findOne({ phone });

        if (!user) {
          reject({
            message: "Account not found",
          });
        }

        await verifyOtp(phone, code);

        const npassword = await bcrypt.hash(password, 10);
        await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .updateOne(
            { phone },
            {
              $set: {
                password: npassword,
              },
            }
          );
        resolve({ message: "Password reset successfully" });
      } catch (error) {
        return reject({ message: error.message || "Server Error" });
      }
    });
  },
  ////////////////////////////send otp/////////////////////////////
  sendOtp: (mobile, channel, isExistUser = true) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mobile) {
          return reject({
            success: false,
            message: `Please provide an phone number`,
          });
        }

        const user = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .findOne({ phone: mobile });

        if ((!user && isExistUser) || (user && !isExistUser)) {
          return reject({
            success: false,
            message:
              !user && isExistUser
                ? `User not found`
                : "Phone No. already exist",
          });
        }

        const { message } = await sentOtp(mobile, channel);

        resolve({
          message,
          mobile,
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ////////////////////////////verify otp/////////////////////////////
  doOtpLogin: (mobile, code) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mobile || !code) {
          return reject({
            message: `Please provide an phone phone and verification code`,
          });
        }

        const user = await db
          .get()
          .collection(collections.USERS_COLLECTION)
          .findOne({ phone: mobile });

        if (!user) {
          return reject({
            message: `User not found`,
          });
        }

        const { valid } = await verifyOtp(mobile, code);

        if (!valid) {
          reject({
            message: `Invalid OTP`,
          });
        }

        resolve({
          user,
          isValid: valid,
          message: `Welcome Back ${user.firstName} ${user.lastName}`,
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ////////////////////////////Add to cart/////////////////////////////
  addToCart: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!productId || !userId) {
          return reject({
            message: "Provide userId and productId",
          });
        }

        const productObject = {
          item: objectId(productId),
          quantity: 1,
        };

        // Check user has any cart
        const userCart = await db
          .get()
          .collection(collections.CART_COLLECTION)
          .findOne({ user: objectId(userId) });

        if (userCart) {
          // Check product exist in cart
          const productExist = userCart.products.findIndex(
            (products) => products.item == productId
          );

          // if item exist in cart then Update a quantity otherwise create a new item
          if (productExist != -1) {
            await db
              .get()
              .collection(collections.CART_COLLECTION)
              .updateOne(
                {
                  user: objectId(userId),
                  "products.item": objectId(productId),
                },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              );
            return resolve({
              message: "The Item quantity updated in your bag",
              quantity: productExist.quantity + 1,
              cartId: userCart._id,
            });
          } else {
            await db
              .get()
              .collection(collections.CART_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: { products: productObject },
                }
              );
            return resolve({
              message: "Item was added",
              quantity: productObject.quantity,
              cartId: userCart._id,
            });
          }
        } else {
          const ncart = await db
            .get()
            .collection(collections.CART_COLLECTION)
            .insertOne({
              user: objectId(userId),
              products: [productObject],
            });
          return resolve({
            message: "Item was added",
            quantity: productObject.quantity,
            cartId: ncart.insertedId,
          });
        }
      } catch (error) {
        return reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ////////////////////////////add guest cart items/////////////////////////////
  addGuestCartItemsToUserCart: (guestId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId || !guestId) {
          return reject({
            message: "Provide userId and guestId",
          });
        }

        // Check guest has any cart
        const guestCart = await db
          .get()
          .collection(collections.CART_COLLECTION)
          .findOne({ user: objectId(guestId) });
        const userCart = await db
          .get()
          .collection(collections.CART_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (guestCart) {
          if (userCart) {
            guestCart.products.map(async (product) => {
              // Check product exist in cart
              const productExist = userCart.products.find(
                (products) =>
                  products.item.toString() === product.item.toString()
              );
              // if item exist in cart then Update a quantity otherwise create a new item
              if (productExist) {
                await db
                  .get()
                  .collection(collections.CART_COLLECTION)
                  .updateOne(
                    {
                      user: objectId(userId),
                      "products.item": objectId(product.item),
                    },
                    {
                      $set: {
                        "products.$.quantity":
                          product.quantity + productExist.quantity,
                      },
                    }
                  );
              } else {
                await db
                  .get()
                  .collection(collections.CART_COLLECTION)
                  .updateOne(
                    { user: objectId(userId) },
                    {
                      $push: { products: product },
                    }
                  );
              }
            });
            await db
              .get()
              .collection(collections.CART_COLLECTION)
              .removeOne({ user: objectId(guestId) });
          } else {
            await db
              .get()
              .collection(collections.CART_COLLECTION)
              .updateOne(
                { user: objectId(guestId) },
                {
                  $set: { user: userId },
                }
              );
          }
        }
        return resolve();
      } catch (error) {
        return reject({
          message: error.message || "Server Error",
        });
      }
    });
  },
  ////////////////////////////get cart products/////////////////////////////
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) {
          return reject({
            message: "Provide userId",
          });
        }

        const cartItems = await db
          .get()
          .collection(collections.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: objectId(userId) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: collections.PRODUCTS_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
          ])
          .toArray();
        resolve(cartItems);
      } catch (error) {
        return reject({
          message: error.message || "Server Error",
        });
      }
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        var sumQuantity = 0;
        for (let i = 0; i < cart.products.length; i++) {
          sumQuantity += cart.products[i].quantity;
        }
        count = sumQuantity;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then(() => {
          resolve({ status: true });
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    { $toInt: "$quantity" },
                    { $toInt: "$product.Offer" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(total[0] ? total[0].total : 0);
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log(cart);
      resolve(cart);
    });
  },

  placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Orderr->", order, products, total);

        // if (!order || products.length <= 0 || !total) {
        //   return resolve({
        //     message: "kuhygtfdsdfghui",
        //   });
        // }

        const status = order["payment-method"] === "COD" ? "placed" : "pending";
        const today = moment();

        products = products.map((cart) => {
          const product = {
            item: cart.item,
            quantity: cart.quantity,
            price: parseInt(cart.product.Offer),
            status: status,
            totalProductPrice:
              parseInt(cart.product.Offer) * parseInt(cart.quantity),
          };
          return product;
        });

        let orderObject = {
          deliveryDetails: {
            type: order.type,
            name: order.name,
            phone: order.phone,
            place: order.place,
            pincode: order.pincode,
            address: order.address,
          },
          userId: objectId(order.userId),
          paymentMethod: order["payment-method"],
          products,
          cgst:order.CGST,
          sgst:order.SGST,
          gst:order.GST,
          parcelCharge:order.parcelCharge,
          discount: order.discount,
          netTotal:(total+order.CGST + order.SGST+ order.parcelCharge) - order.discount,
          totalPrice: total,
          totalReductionPrice: 0,
          totalOrderPrice: total - 0,
          status: status,
          date: today.utcOffset("+05:30").format("dddd | DD/MM/ YYYY | LT"),
          createdAt: new Date(),
        };

        // console.log("ORDER->", orderObject);

        const lastOrder = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find()
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();

        const orderId =
          lastOrder.length === 1
            ? "FOID" + (parseInt(lastOrder[0].orderId.slice(4)) + 1)
            : "FOID100";

        orderObject.orderId = orderId;

        db.get()
          .collection(collections.ORDER_COLLECTION)
          .insertOne({ ...orderObject })
          .then((response) => {
            db.get()
              .collection(collections.CART_COLLECTION)
              .removeOne({ user: objectId(order.userId) });
            resolve(response.ops[0]._id);
          });
      } catch (error) {
        reject({
          message: error.message || "Server",
        });
      }
    });
  },

  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
      // console.log(orders);
      resolve(orders);
    });
  },

  getOrderById: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) });
      resolve(order);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              orderId: "$_id",
              deliveryDetails: "$deliveryDetails",
              item: "$products.item",
              quantity: "$products.quantity",
              price: "$products.price",
              status: "$products.status",
              totalPrice: "$products.totalProductPrice",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              orderId: 1,
              deliveryDetails: 1,
              item: 1,
              quantity: 1,
              price: 1,
              totalPrice: 1,
              status: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(products);
    });
  },

  // generateRazorpay: (orderId, totalPrice) => {
  //   return new Promise((resolve, reject) => {
  //     var options = {
  //       amount: totalPrice * 100, // amount in the smallest currency unit
  //       currency: "INR",
  //       receipt: "" + orderId,
  //     };
  //     instance.orders.create(options, function (err, order) {
  //       console.log("New Order : ", order);
  //       resolve(order);
  //     });
  //   });
  // },

  // verifyPayment: (details) => {
  //   return new Promise((resolve, reject) => {
  //     const crypto = require("crypto");
  //     let hmac = crypto.createHmac("sha256", "xPzG53EXxT8PKr34qT7CTFm9");

  //     hmac.update(
  //       details["payment[razorpay_order_id]"] +
  //         "|" +
  //         details["payment[razorpay_payment_id]"]
  //     );
  //     hmac = hmac.digest("hex");

  //     if (hmac == details["payment[razorpay_signature]"]) {
  //       resolve();
  //     } else {
  //       reject();
  //     }
  //   });
  // },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
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

        if (
          !order ||
          (order && order.status != "placed" && order.status != "confirmed")
        ) {
          return reject({
            message: !order
              ? "Order not found"
              : "Food is started to cook, so not able to cancel",
          });
        }

        const modifiedOrderItems = order.products.map((product) => {
          product.status = "cancelled";
          return product;
        });

        await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                products: modifiedOrderItems,
                status: "cancelled",
                reason: "Cancelled by user",
              },
            }
          );
        resolve({
          message: "Order Cancelled",
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },

  cancelOrderItem: (orderId, productId) => {
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

        if (
          !order ||
          (order && order.status != "placed" && order.status != "confirmed")
        ) {
          return reject({
            message: !order
              ? "Order not found"
              : "Food is started to cook, so not able to cancel",
          });
        }

        let cancelledPrice = 0;
        const modifiedOrderItems = order.products.map((product) => {
          if (
            product.status != "cancelled" &&
            product.item.toString() === productId
          ) {
            cancelledPrice += product.totalProductPrice;
            product.status = "cancelled";
          }
          return product;
        });

        await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                products: modifiedOrderItems,
                totalReductionPrice:
                  order.totalOrderPrice - cancelledPrice === 0
                    ? 0
                    : order.totalReductionPrice + cancelledPrice,
                totalOrderPrice:
                  order.totalOrderPrice - cancelledPrice === 0
                    ? order.totalPrice
                    : order.totalOrderPrice - cancelledPrice,
                status:
                  order.totalOrderPrice - cancelledPrice === 0
                    ? "cancelled"
                    : order.status,
                reason:
                  order.totalOrderPrice - cancelledPrice === 0
                    ? "Due to cancellation of all items in a order by user"
                    : undefined,
              },
            }
          );
        resolve({
          message: "Order Item Cancelled",
        });
      } catch (error) {
        reject({
          message: error.message || "Server Error",
        });
      }
    });
  },

  searchProduct: (details) => {
    console.log("searched +++++++ ");
    return new Promise(async (resolve, reject) => {
      var result = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find({
          Name: new RegExp(details.search, "i"),
        })
        .toArray();
      console.log(result);
      resolve(result);
    });
  },
};

//   searchProduct: (details) => {
//     console.log("searched +++++++ ");
//     return new Promise(async (resolve, reject) => {
//       db.get()
//         .collection(collections.PRODUCTS_COLLECTION)
//         .createIndex({ Name: "text" })
//         .then(async () => {
//           let result = await db
//             .get()
//             .collection(collections.PRODUCTS_COLLECTION)
//             .find({
//               $text: {
//                 $search: details.search,
//               },
//             })
//             .toArray();
//             console.log(result);
//           resolve(result);
//         });
//     });
//   },
// };
