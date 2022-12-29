// Description: Twilio OTP verification
const { TWILLIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN, TWILLIO_SERVICE_ID } =
  require("../config/constant").TWILLIO;

const client = require("twilio")(TWILLIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN);

const setErrorMessage = (message, code) => {
  let error = { message };

  if (code === 11000) {
    error.message = `Duplicate field value entered`;
  }

  if (code === "EAI_AGAIN") {
    error.message = `Check your Internet Connection`;
  }

  if (code === 20404) {
    error.message = `OTP request not found, Try again!!`;
  }
  console.log(error);
  return error;
};

module.exports = {
  sentOtp: (mobile, channel = "sms") => {
    return new Promise((resolve, reject) => {
      if (!mobile || (mobile && mobile.length < 9)) {
        return reject({
          success: false,
          message: `Please provide a valid phone number`,
        });
      }
      client.verify
        .services(TWILLIO_SERVICE_ID)
        .verifications.create({
          to: `+91${mobile}`,
          channel,
        })
        .then(async (verification) => {
          console.log(verification.sid);
          resolve({
            success: true,
            message: `OTP sended to ********${String(mobile).slice(-2)} number`,
            sid: verification.sid,
            mobile,
          });
        })
        .catch((error) => {
          const { message } = setErrorMessage(error.message, error.code);
          reject({ success: false, message: `${message}` });
        });
    });
  },
  verifyOtp: (mobile, code) => {
    return new Promise((resolve, reject) => {
      if (!mobile || !code) {
        return reject({
          success: false,
          message: `Please provide an phone number and verification code`,
        });
      }
      client.verify
        .services(TWILLIO_SERVICE_ID)
        .verificationChecks.create({ to: `+91${mobile}`, code: code })
        .then(async (verification_check) => {
          if (verification_check.valid) {
            resolve({
              success: true,
              valid: true,
              message: `OTP verified`,
              mobile,
            });
          } else {
            reject({
              success: false,
              valid: false,
              message: `Invalid OTP`,
            });
          }
        })
        .catch(async (error) => {
          const { message } = await setErrorMessage(error.message, error.code);
          reject({
            success: false,
            message: `${message}`,
          });
        });
    });
  },
};
