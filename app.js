const express = require("express"),
  bodyParser = require("body-parser"),
  path = require("path"),
  cors = require("cors"),
  reports = require("./routes/reports");
var PORT = process.env.PORT || 3000;

app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth/reports", reports);

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, (error) => {
  console.log(`listening on PORT: ${PORT}`);
  if (error) {
    console.log(error);
  }
});
