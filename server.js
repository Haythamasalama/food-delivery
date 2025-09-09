const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

const authRoutes = require("./app/routes/auth.routes");
const adminRoutes = require("./app/routes/admin.routes");
const customerRoutes = require("./app/routes/customer.routes");

const app = express();

// Middleware
app.use(cookieParser());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./db/models");
db.sequelize.sync({ force: false });
// if (process.env.NODE_ENV === "development") {
//   db.sequelize.sync({ force: false, alter: true });
// } else {
//   db.sequelize.sync({ force: false });
// }

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
