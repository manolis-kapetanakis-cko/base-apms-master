const pageLoader = document.querySelector(".loader");
const form = document.getElementById("payment-form");
const inputs = document.getElementById("inputs");
const nameInput = document.getElementById("cardholder");
const cardInput = document.querySelector(".card-number-frame");
const dateInput = document.querySelector(".expiry-date-frame");
const cvvInput = document.querySelector(".cvv-frame");
const nameLabel = document.getElementById("name-label");
const cardLabel = document.getElementById("card-label");
const dateLabel = document.getElementById("date-label");
const cvvLabel = document.getElementById("cvv-label");
const payButton = document.querySelector(".pay");
const scheme = document.getElementById("card-scheme");
const cardHint = document.querySelector(".card-hint");
const dateHint = document.querySelector(".expiry-date-hint");
const cvvHint = document.querySelector(".cvv-hint");
const payLoader = document.querySelector(".pay-loader");
const toastBar = document.getElementById("toast_bar");
const switcher = document.getElementById("theme-switch");
const outcome = document.getElementById("outcome");
const error = document.querySelector(".error");
const errorMessage = document.getElementById("error-hint");
const cardsDiv = document.getElementById("cards-payment");
const apmsDiv = document.getElementById("apms-payment");
const idealDiv = document.getElementById("ideal-payment");
const idealSelector = document.querySelector("#ideal-selector");
const idealBtn = document.getElementById("ideal-pay");
const klarnaDiv = document.getElementById("klarna-payment");

var PAYMENT_ID = "";
var theme = "";

let paymentType;

const crossVisible =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';
const crossHidden =
  '<svg class="cross hide" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

const handleResponse = data => {
  payLoader.classList.add("hide");
  PAYMENT_ID = data.id;
  // Payment approved
  if (data.approved) {
    payButton.style.backgroundColor = "var(--button-background)";
    showCheckmark();
    setTimeout(() => {
      hideCheckmark();
      payButton.innerHTML = "&#10227; New Payment";

      // Colour Frames input borders to show successful payment
      nameInput.classList.add("success");
      cardInput.classList.add("success");
      dateInput.classList.add("success");
      cvvInput.classList.add("success");

      payButton.style.pointerEvents = "auto";
    }, 1200);
  }
  // Payment declined / timeout error
  else {
    payButton.style.backgroundColor = "var(--button-background-error)";
    showCross();
    setTimeout(() => {
      hideCross();
      payButton.innerHTML = "&#10227; Retry";
      inputs.style.pointerEvents = "auto";
      payButton.style.pointerEvents = "auto";
      error.classList.remove("hide");
    }, 1200);
  }
};

const cleanState = () => {
  payButton.innerHTML = "Pay Now";
  payButton.style.backgroundColor = "var(--button-background)";
  pageLoader.style.display = "";
  form.style.display = "none";
  initializeFrames();
  nameInput.value = "";
  nameLabel.classList.remove("up");
  cardLabel.classList.remove("up");
  dateLabel.classList.remove("up");
  cvvLabel.classList.remove("up");
  scheme.removeAttribute("src");
  scheme.removeAttribute("alt");
  state = {
    "card-number": {
      isValid: false,
      isEmpty: true,
      isFocused: false
    },
    "expiry-date": {
      isValid: false,
      isEmpty: true,
      isFocused: false
    },
    cvv: {
      isValid: false,
      isEmpty: true,
      isFocused: false
    }
  };
  hideCheckmark();
  hideCross();
  inputs.style.pointerEvents = "auto";
  nameInput.classList.remove("success");
  cardInput.classList.remove("success");
  dateInput.classList.remove("success");
  cvvInput.classList.remove("success");
  error.classList.add("hide");
  errorMessage.innerHTML = "Payment declined";
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
    .catch(er => (errorMessage.innerHTML = er));
};

// For connection timeout error handling
const timeout = (ms, promise) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("Connection timeout"));
    }, ms);
    promise.then(resolve, reject);
  });
};

// Socket part so we can handle webhooks:
var socket = io();
socket.on("webhook", webhookBody => {
  if (webhookBody.paymentId !== PAYMENT_ID) {
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
  setTimeout(function () {
    newToast.classList.remove("show");
    newToast.outerHTML = "";
  }, 5000);
});

/* Themes */

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on page reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
  if (theme == "dark") {
    switcher.checked = true;
  }
}

// Dark mode switch
document.getElementById("theme-switch").addEventListener("change", event => {
  themeSwitch(event);
});

const themeSwitch = event => {
  if (event.target.checked) {
    // Dark mode
    document.body.className = "";
    document.body.classList.add("dark");
    setTheme("dark");
    getTheme();
    cleanState();
  } else {
    // Light mode
    document.body.className = "";
    document.body.classList.add("light");
    setTheme("light");
    getTheme();
    cleanState();
  }
};

function getTheme() {
  theme = localStorage.getItem("theme");
}

function setTheme(mode) {
  localStorage.setItem("theme", mode);
}

/* Outcome animations */

const showCheckmark = () => {
  outcome.classList.add("checkmark", "draw");
};
const hideCheckmark = () => {
  outcome.classList.remove("checkmark", "draw");
};

const showCross = () => {
  outcome.class = "cross";
  outcome.innerHTML = crossVisible;
};
const hideCross = () => {
  outcome.classList.remove("cross");
  outcome.innerHTML = crossHidden;
};

const paymentOption = type => {
  paymentType = type;
  if (type === "cards") {
    cardsDiv.classList.remove("hide");
    apmsDiv.classList.add("hide");
    idealDiv.classList.add("hide");
    klarnaDiv.classList.add("hide");
  } else if (type === "apms") {
    cardsDiv.classList.add("hide");
    apmsDiv.classList.remove("hide");
    idealDiv.classList.add("hide");
    klarnaDiv.classList.add("hide");
  } else if (type === "ideal") {
    cardsDiv.classList.add("hide");
    apmsDiv.classList.add("hide");
    idealDiv.classList.remove("hide");
    klarnaDiv.classList.add("hide");
  } else {
    cardsDiv.classList.add("hide");
    apmsDiv.classList.add("hide");
    idealDiv.classList.add("hide");
    klarnaDiv.classList.remove("hide");
  }
};
