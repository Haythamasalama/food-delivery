const express = require("express");
const http = require("http");
require("dotenv").config();
const { initSocket } = require("./app/utils/socket");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

const authRoutes = require("./app/routes/auth.routes");
const adminRoutes = require("./app/routes/admin.routes");
const customerRoutes = require("./app/routes/customer.routes");
const menuRoutes = require("./app/routes/menu.routes");
const orderRoutes = require("./app/routes/order.routes");
const driverRoutes = require("./app/routes/driver.routes");
const driverLocationRoutes = require("./app/routes/driverLocation.routes");

const app = express();
const server = http.createServer(app);

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

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/driver-location", driverLocationRoutes);

const socketHelpers = initSocket(server);

// Inject socket into controller
const driverLocationController = require("./app/controllers/driverLocation.controller");
driverLocationController.setSocket(socketHelpers);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
