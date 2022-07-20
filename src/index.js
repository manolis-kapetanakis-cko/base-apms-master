const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const socket = require("socket.io");

const apiRoutes = require("./back-end/api");

// Configure express to use body parser and cors, and add our API endpoints
const app = express();
app.use(express.static(path.join(__dirname, "./front-end")));
app.use(
  cors({
    origin: "*"
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(apiRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./front-end/payment/index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "./front-end/outcome/success.html"));
});

app.get("/fail", (req, res) => {
  res.sendFile(path.join(__dirname, "./front-end/outcome/fail.html"));
});

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(
    "\x1b[36m%s\x1b[34m%s\x1b[0m",
    "💪 Server running on ➡️ ",
    `http://localhost:${port}`
  );
});

// Socket
var io = socket(server);

app.post("/webhook", (req, res) => {
  io.emit("webhook", {
    type: req.body.type,
    paymentId: req.body.data.id
  });
  res.sendStatus(200);
});
