const route = require("express").Router();
const axios = require("axios");

const { Checkout } = require("checkout-sdk-node");
const cko = new Checkout("sk_test_07fa5e52-3971-4bab-ae6b-a8e26007fccc");
const SK = "sk_test_07fa5e52-3971-4bab-ae6b-a8e26007fccc";
const API = "https://api.sandbox.checkout.com/";

route.post("/payWithToken", async (req, res) => {
  const payment = await cko.payments.request({
    source: {
      token: req.body.token
    },
    currency: "EUR",
    amount: 2000, // pence
    reference: "TEST-ORDER"
  });
  res.send(payment);
});

route.get("/getIdealIssuers", async (req, res) => {
  console.log("Ideal Issuers Server");
  let issuers;
  try {
    issuers = await axios.get(
      "https://api.sandbox.checkout.com/ideal-external/issuers",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: SK
        }
      }
    );
    // console.log(issuers.data.countries[0].issuers.length);
    // console.log(issuers.data.countries);
    res.status(200).send(issuers.data);
  } catch (err) {
    res.status(500).send(err.response);
  }
});

route.post("/payWithIdeal", async (req, res) => {
  let issuer_id = req.body.issuer_id;
  let payment;
  payment = await cko.payments.request({
    source: {
      type: "ideal",
      bic: issuer_id,
      description: "ORD50234E89",
      language: "nl"
    },
    currency: "EUR",
    amount: 2000, // pence
    success_url: req.body.url + "/success",
    failure_url: req.body.url + "/fail"
  });
  res.send(payment);
});

route.post("/payWithAPM", async (req, res) => {
  let option = req.body.option;
  console.log(option);
  let payment;
  if (option == "ideal") {
    payment = await cko.payments.request({
      source: {
        type: "ideal",
        bic: "INGBNL2A",
        description: "ORD50234E89",
        language: "nl"
      },
      currency: "EUR",
      amount: 2000, // pence
      success_url: req.body.url + "/success",
      failure_url: req.body.url + "/fail"
    });
  } else if (option == "sofort") {
    payment = await cko.payments.request({
      source: {
        type: "sofort"
      },
      currency: "EUR",
      amount: 2000, // pence
      success_url: req.body.url + "/success",
      failure_url: req.body.url + "/fail"
    });
  } else if (option == "p24") {
    payment = await cko.payments.request({
      source: {
        type: "p24",
        payment_country: "PL",
        account_holder_name: "Bruce Wayne",
        account_holder_email: "bruce@wayne-enterprises.com",
        billing_descriptor: "P24 Demo Payment"
      },
      currency: "PLN",
      amount: 200, // pence
      success_url: req.body.url + "/success",
      failure_url: req.body.url + "/fail"
    });
  } else if (option == "giropay") {
    payment = await cko.payments.request({
      source: {
        type: "giropay",
        purpose: "Mens black t-shirt L"
      },
      currency: "EUR",
      amount: 2000, // pence
      success_url: req.body.url + "/success",
      failure_url: req.body.url + "/fail"
    });
  } else if (option == "paypal") {
    payment = await cko.payments.request({
      source: {
        type: "paypal",
        invoice_number: "CKO0340001aa"
      },
      currency: "EUR",
      amount: 2000, // pence
      success_url: req.body.url + "/success",
      failure_url: req.body.url + "/fail"
    });
  }
  res.send(payment);
});

// Get payment details by cko-session-id
route.post("/getPaymentBySession", async (req, res) => {
  const details = await cko.payments.get(req.body.sessionId);
  res.send(details);
});

//KLARNA
route.post("/klarnaSession", async (req, res) => {
  console.log("Initialising Klarna Session");
  let payment;
  try {
    payment = await axios.post(
      "https://api.sandbox.checkout.com/apms/klarna/credit-sessions",
      {
        purchase_country: "GB",
        currency: "GBP",
        locale: "en-GB",
        amount: 2499,
        tax_amount: 1,
        products: [
          {
            name: "Brown leather belt",
            quantity: 1,
            unit_price: 2499,
            tax_rate: 0,
            total_amount: 2499,
            total_tax_amount: 0
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: SK
        }
      }
    );
    console.log(payment.data);
    res.status(200).send(payment.data);
  } catch (err) {
    res.status(500).send(err.response);
  }
});

route.post("/klarnaPayment/", async (req, res) => {
  let authorization_token = req.body.authorization_token;
  console.log("\nInitialising Klarna Payment: " + authorization_token);
  let payment;
  try {
    payment = await axios.post(
      API + "payments",
      {
        amount: 2499,
        currency: "GBP",
        success_url: req.body.url + "/success",
        failure_url: req.body.url + "/fail",
        source: {
          type: "klarna",
          authorization_token: authorization_token,
          locale: "en-GB",
          purchase_country: "GB",
          tax_amount: 0,
          billing_address: {
            given_name: "John",
            family_name: "Doe",
            email: "johndoe@email.com",
            title: "Mr",
            street_address: "13 New Burlington St",
            street_address2: "Apt 214",
            postal_code: "W13 3BG",
            city: "London",
            phone: "01895808221",
            country: "GB"
          },
          products: [
            {
              name: "Brown leather belt",
              quantity: 1,
              unit_price: 2499,
              tax_rate: 0,
              total_amount: 2499,
              total_tax_amount: 0
            }
          ]
        }
      },

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: SK
        }
      }
    );
    console.log(payment.data);
    res.status(200).send(payment.data);
  } catch (err) {
    console.log("ERR: \n");
    console.log(err.response.data);
    res.status(500).send(err.response);
  }
});

module.exports = route;
