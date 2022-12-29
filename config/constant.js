// Description: This file contains all the collections name used in the project
require("dotenv").config();

const TWILLIO_ACCOUNT_SID =
  process.env.TWILLIO_ACCOUNT_SID || "TWILLIO_ACCOUNT_SID";
const TWILLIO_AUTH_TOKEN =
  process.env.TWILLIO_AUTH_TOKEN || "TWILLIO_AUTH_TOKEN";
const TWILLIO_SERVICE_ID =
  process.env.TWILLIO_SERVICE_ID || "TWILLIO_SERVICE_ID";

const TWILLIO = {
  TWILLIO_ACCOUNT_SID,
  TWILLIO_AUTH_TOKEN,
  TWILLIO_SERVICE_ID,
};

const USER_ID_KEY = "59eeef57496815b5531f1875080abe5b";
const ADMIN_ID_KEY = "15230e3dbba5afd24117c6472895fa00";
const GUEST_ID_KEY = "29272f677dd16553e508858f1dd9d64f";

const COOKIE_KEYS = {
  USER_ID_KEY,
  ADMIN_ID_KEY,
  GUEST_ID_KEY,
};

const config = {
  TWILLIO,
  COOKIE_KEYS,
};

module.exports = config;
