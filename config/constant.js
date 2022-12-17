require("dotenv").config();

const TWILLIO_ACCOUNT_SID =
  process.env.TWILLIO_ACCOUNT_SID || "ACabb41ce9560dbf9572308f298ac4b53e";
const TWILLIO_AUTH_TOKEN =
  process.env.TWILLIO_AUTH_TOKEN || "f718dc9f99eb5f715a7689361a327931";
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
