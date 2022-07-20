// KLARNA:
let promiseKlarna = new Promise((resolve, reject) => {
  let client_token;
  http(
    {
      method: "POST",
      route: "/klarnaSession",
      body: {}
    },
    data => {
      client_token = data.client_token;
      console.log("\nClient Token:\n" + client_token);
      if (client_token) resolve(client_token);
    }
  );
}).then(client_token => {
  console.log("\nKlarna...\n");
  window.klarnaAsyncCallback(client_token);
});

window.klarnaAsyncCallback = function(client_token) {
  // INIT
  try {
    Klarna.Payments.init({
      client_token: client_token
    });
  } catch (e) {
    console.log("Init:\n" + e);
  }
  //LOAD...
  try {
    Klarna.Payments.load(
      {
        container: "#klarna_container",
        payment_method_categories: ["pay_later", "pay_over_time"],
        instance_id: "klarna-payments-instance"
      },
      {
        // data
      },
      // callback
      function(response) {
        console.log("Load Success:\n");
        console.log(response);
      }
    );
  } catch (e) {
    console.log("Load:\n" + e);
  }
};

// AUTHORISE
let klarnaAuth = function() {
  try {
    Klarna.Payments.authorize(
      // options
      {
        instance_id: "klarna-payments-instance" // Same as instance_id set in Klarna.Payments.load().
      },
      {
        // data
        billing_address: {
          given_name: "John",
          family_name: "Doe",
          email: "johndoe@email.com",
          title: "Mr",
          street_address: "13 New Burlington St",
          street_address2: "Apt 214",
          postal_code: "W13 3BG",
          city: "London",
          region: "",
          phone: "01895808221",
          country: "GB"
        }
      },
      function(response) {
        http(
          {
            method: "POST",
            route: "/klarnaPayment",
            body: {
              authorization_token: response.authorization_token,
              url: window.location.origin
            }
          },
          data => {
            console.log("Payment Successful:\n");
            payLoader.classList.add("hide");
            console.log(data._links.redirect.href);
            window.location = data._links.redirect.href;
          }
        );
      }
    );
  } catch (e) {
    console.log("Authorise:\n" + e);
  }
};
///// End of Klarna setup
