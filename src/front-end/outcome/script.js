const errorMessage = document.getElementById("error");
const outcome = document.getElementById("confirm-animation");
const toastBar = document.getElementById("toast_bar");
const backButton = document.querySelector(".back");

const cross =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

var theme = "";
var PAYMENT_ID = "";

// Socket so we can handle webhooks:
var socket = io();

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on page reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
}

// Get session ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const SESSION_ID = urlParams.get("cko-session-id");

const showOutcome = () => {
  // Get payment details
  http(
    {
      method: "POST",
      route: "/getPaymentBySession",
      body: {
        sessionId: SESSION_ID
      }
    },
    data => {
      console.log("Payment details: ", data);
      // Confirmation details
      if (data.approved) {
        PAYMENT_ID = data.id;
        outcome.style.backgroundColor = "var(--green)";
        outcome.classList.add("checkmark", "draw");
      } else {
        outcome.style.backgroundColor = "var(--red)";
        outcome.innerHTML = cross;
        outcome.classList.add("cross", "draw");
      }
    }
  );
};

// Utility function to send HTTP calls to our back-end API
const http = ({ method, route, body }, callback) => {
  let requestData = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };

  if (method.toLocaleLowerCase() === "get") {
    delete requestData.body;
  }

  // Timeout after 10 seconds
  timeout(10000, fetch(`${window.location.origin}${route}`, requestData))
    .then(res => res.json())
    .then(data => callback(data))
    .catch(er => console.log(er));
  // .catch(er => (errorMessage.innerHTML = er));
};

// For connection timeout error handling
const timeout = (ms, promise) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("Connection timeout"));
    }, ms);
    promise.then(resolve, reject);
  });
};

socket.on("webhook", webhookBody => {
  if (webhookBody.paymentId !== PAYMENT_ID) {
    console.log("webhook pay id != PAYMENT_ID");
    return;
  }
  let tempWebhook = webhookBody.type.replace("_", " ");

  let newToast = document.createElement("div");
  newToast.classList.add("toast_body");

  // WEBHOOK div
  let newWHDiv = document.createElement("div");
  newWHDiv.innerHTML = "WEBHOOK";
  newWHDiv.classList.add("wh_div");
  newToast.appendChild(newWHDiv);

  // Payment type div
  let newPTDiv = document.createElement("div");
  newPTDiv.innerHTML = tempWebhook;
  newPTDiv.classList.add("pt_div");
  newToast.appendChild(newPTDiv);

  toastBar.append(newToast);
  newToast.classList.add("show");
  console.log("webhook shown");

  setTimeout(function() {
    newToast.classList.remove("show");
    newToast.outerHTML = "";
    console.log("webhook hidden");
  }, 5000);
});

backButton.onclick = function() {
  location.replace("/");
};

showOutcome();
