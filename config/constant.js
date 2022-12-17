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

const config = {
  TWILLIO,
};

module.exports = config;