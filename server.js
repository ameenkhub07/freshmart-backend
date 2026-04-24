const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// Your Secret Razorpay Keys!
const razorpay = new Razorpay({
  key_id: "rzp_test_ShEoixFb9VnH1J",
  key_secret: "8lNPJZjK2NYrCPYD5JzLZXhX",
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, 
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating order");
  }
});

app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  
  // Double checking the signature with your secret key
  const expectedSign = crypto
    .createHmac("sha256", "8lNPJZjK2NYrCPYD5JzLZXhX")
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is awake on port " + port);
});
