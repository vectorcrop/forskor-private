// Description: This file is the entry point of the application
var createError = require("http-errors");
var express = require("express");
const http = require("http");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var session = require("express-session");
const connectSocket = require("./socket/socket.io");
const adminHelper = require("./helper/adminHelper");
const { log } = require("console");
var app = express();
const { ADMIN_ID_KEY, USER_ID_KEY } = require("./config/constant").COOKIE_KEYS;
const { DISCOUNT_PERCENTAGE, DISCOUNT_TOTAL_LIMIT, CGST_PERCENTAGE, SGST_PERCENTAGE, PARCEL_CHARGE_PERCENTAGE,DISCOUNT_MAXIMUM_AMOUNT} =
  require("./config/constant").SETTINGS;

// Socket Config
var server = http.createServer(app);

// Socket Connection
const io = connectSocket(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Handlebars Config for Layouts
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layout: "layout2",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/header-partials/",
    helpers: {
      incremented: function (index) {
        index++;
        return index;
      },
      getDay: function (date) {
        // console.log(date);
        return date.split("|")[0];
      },
      getDate: function (date) {
        if (!date) return "Invalid";
        return date.split("|")[1];
      },
      getTime: function (date) {
        if (!date) return "Invalid";
        return date.split("|")[2];
      },
      getEncodedValue: function (value) {
        return encodeURIComponent(value);
      },
      getSmallerCase: function (text) {
        return text.toLowerCase();
      },
      getTitleCase: function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      },
      getRole: function (role) {
        if (role === "1" || role === "2") return "Casher";
        if (role === "3") return "Chef";
        if (role === "4") return "Delivery Boy";
        return "No Role";
      },
      getStatusColor: function (status = "") {
        switch (status) {
          case "placed":
            return "#3498DB";
          case "confirmed":
            return "#1ABC9C";
          case "cooking":
            return "#F39C12";
          case "packed":
            return "#16A085";
          case "dispatched":
            return "#5D6D7E";
          case "picked":
            return "#28B463";
          case "delivered":
            return "#27AE60";
          case "cancelled":
            return "#E74C3C";
          default:
            return "blue";
        }
      },
      ifeq: function (a, b, options) {
        if (a == b) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifneq: function (a, b, options) {
        if (a != b) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifeqarray: function (a, b, options) {
        const arrayOfB = b.split(",");
        if (arrayOfB.length <= 0) return options.fn(this);
        if (arrayOfB.includes(a)) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifneqarray: function (a, b, options) {
        const arrayOfB = b.split(",");
        if (arrayOfB.length <= 0) return options.inverse(this);
        if (arrayOfB.includes(a)) {
          return options.inverse(this);
        }
        return options.fn(this);
      },
      findTotal: (items) => {
        return items.reduce(
          (total, item) => item.quantity * item.product.Price + total,
          0
        );
      },
      getStatusColor: (status) => {
        return status ? "green" : "red";
      },
      getStatusBackgroundColor: (status) => {
        return status ? "green" : "white";
      },
      getStatusChecked: (status) => {
        return status ? checked : null;
      },
      getTotalWithCGST: (price) => {
        return (price * CGST_PERCENTAGE) / 100;
      },
      getTotalWithSGST: (price) => {
        return (price * SGST_PERCENTAGE) / 100;
      },
      getParcelCharge:(price)=>{
        return(price * PARCEL_CHARGE_PERCENTAGE) /100;
      },
      getGstAmt:(price)=>{
        return(price * (CGST_PERCENTAGE + SGST_PERCENTAGE ))/100;
      },
      getDiscountPercentage: () => {
        return DISCOUNT_PERCENTAGE;
      },
      getTotalDiscount : (price) => {
        let total = price;
        //let total = price + (price * (CGST_PERCENTAGE + SGST_PERCENTAGE + PARCEL_CHARGE_PERCENTAGE )) / 100;
      
        // Check if the total exceeds the discount limit
        if (total >= DISCOUNT_TOTAL_LIMIT) {
          // Calculate the discount based on the percentage
          let discount = (price * DISCOUNT_PERCENTAGE) / 100;
          
          // Check if the discount exceeds the maximum discount
          if (discount > DISCOUNT_MAXIMUM_AMOUNT) {
            return DISCOUNT_MAXIMUM_AMOUNT;
          } else {
            return discount;
          }
        } else {
          // If the total doesn't exceed the discount limit, return 0 or the maximum discount if zero
          return total > 0 ? 0 : DISCOUNT_MAXIMUM_AMOUNT;
        }
      }, 
      getTotalWithGST: (price) => {
        let total = price + (price * (CGST_PERCENTAGE + SGST_PERCENTAGE + PARCEL_CHARGE_PERCENTAGE )) / 100;

         // console.log(CGST_PERCENTAGE,SGST_PERCENTAGE,PARCEL_CHARGE_PERCENTAGE , DISCOUNT_TOTAL_LIMIT, total,"444" )
        // if discount avilable
        if (price >= DISCOUNT_TOTAL_LIMIT) {
          return Math.ceil(total - ( price * DISCOUNT_PERCENTAGE) / 100);
        } else {
          return Math.ceil(total);
        }
      },
      // getTotalWithGST: (price) => {
      //   let total = price + (price * (CGST_PERCENTAGE + SGST_PERCENTAGE + PARCEL_CHARGE_PERCENTAGE )) / 100;

      //    console.log(CGST_PERCENTAGE,SGST_PERCENTAGE,PARCEL_CHARGE_PERCENTAGE , DISCOUNT_TOTAL_LIMIT,"----444" )
      //   // if discount avilable
      //   if (total >= DISCOUNT_TOTAL_LIMIT) {
      //     return Math.ceil(total - ( price * DISCOUNT_PERCENTAGE) / 100);
      //   } else {
      //     return Math.ceil(total);
      //   }
      // },
    },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(
  session({
    secret: "Key",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 365*24*60*60*1000 },
  })
);

// Mongodb Connection
db.connect((err) => {
  if (err) console.log("Error" + err);
  else console.log(`MONGODB DATABASE [forskor] connected to ther server`);
});

// socket add in req.io middleware
app.use(function (req, res, next) {
  req.io = io;
  next();
});

// session middleware
app.use(async (req, res, next) => {
  if (!req.session.signedIn && req.cookies[USER_ID_KEY]) {
    const user = await adminHelper.getSingleUser(req.cookies[USER_ID_KEY]);
    req.session.user = user;
    req.session.signedIn = true;
  }
  if (!req.session.signedInAdmin && req.cookies[ADMIN_ID_KEY]) {
    const { admin } = await adminHelper.getAdminById(req.cookies[ADMIN_ID_KEY]);
    req.session.admin = admin;
    req.session.signedInAdmin = true;
  }
  next();
});

// Routes
app.use("/", usersRouter);
app.use("/bigwig", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  var mode = req.app.get("env");
  // render the error page
  res.status(err.status || 500);
  res.render("error", { mode });
});

module.exports = { app, server };
