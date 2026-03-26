const Razorpay = require("razorpay");
const { RAZORPAY_API_KEY, RAZORPAY_SECRET_KEY}=process.env

const razorpay = new Razorpay({
  key_id: RAZORPAY_API_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

module.exports=razorpay;