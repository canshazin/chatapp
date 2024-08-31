require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes.js");
const sequelize = require("./util/database");
const User = require("./models/user.js");

const Group = require("./models/group.js");
const Grp_message = require("./models/grp_message");
const Member = require("./models/member");

const Message = require("./models/message.js");
const Password_Request = require("./models/forgot_password_requests.js");
const path = require("path");

var cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

User.hasMany(Message);
Message.belongsTo(User);
User.hasMany(Password_Request);
Password_Request.belongsTo(User);
// User.hasMany(Download);
// Download.belongsTo(User);
User.hasMany(Grp_message);
Grp_message.belongsTo(User);

Group.hasMany(Grp_message);
Grp_message.belongsTo(Group);

User.belongsToMany(Group, { through: Member });
Group.belongsToMany(User, { through: Member });

sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
