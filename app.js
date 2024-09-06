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

const jwt = require("jsonwebtoken");

var cors = require("cors");

const WebSocket = require("ws");

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
    const server = app.listen(3000);
    const wss = new WebSocket.Server({ server }); // Attach WebSocket server to the same server

    // Store WebSocket clients in a Map where group ID maps to an array of clients
    const groupClientsMap = new Map();

    wss.on("connection", (ws) => {
      let currentGroupId = null;

      // Handle messages from clients
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data);

          if (message.type === "join_group") {
            const newGroupId = message.groupId;

            // Remove ws from old group if it was in one
            if (currentGroupId && currentGroupId !== newGroupId) {
              const oldGroupClients = groupClientsMap.get(currentGroupId);
              if (oldGroupClients) {
                const index = oldGroupClients.indexOf(ws);
                if (index !== -1) {
                  oldGroupClients.splice(index, 1);
                  console.log(`Client removed from group: ${currentGroupId}`);
                  if (oldGroupClients.length === 0) {
                    groupClientsMap.delete(currentGroupId);
                  }
                }
              }
            }

            // Add ws to new group
            if (!groupClientsMap.has(newGroupId)) {
              groupClientsMap.set(newGroupId, []);
            }
            groupClientsMap.get(newGroupId).push(ws);
            currentGroupId = newGroupId;

            console.log(`Client joined group: ${currentGroupId}`);
          } else if (message.type === "send_message" && currentGroupId) {
            // Broadcast the message to all clients in the same group
            broadcastToGroup(currentGroupId, message.content, ws);
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });

      // Handle WebSocket disconnection
      ws.on("close", () => {
        if (currentGroupId) {
          const clients = groupClientsMap.get(currentGroupId);
          if (clients) {
            const index = clients.indexOf(ws);
            if (index !== -1) {
              clients.splice(index, 1);
              console.log(`Client disconnected from group: ${currentGroupId}`);
            }
            if (clients.length === 0) {
              groupClientsMap.delete(currentGroupId);
            }
          }
        }
      });
    });

    // Function to broadcast messages to all clients in the same group
    function broadcastToGroup(groupId, messageContent, senderWs) {
      // Get username from token
      const user = jwt.verify(messageContent.user, process.env.JWT_SECRET_KEY);
      const uname = user.user_uname;
      messageContent.user = uname;
      // Token username ends

      const clients = groupClientsMap.get(groupId);
      if (clients) {
        clients.forEach((clientWs) => {
          if (clientWs !== senderWs) {
            clientWs.send(
              JSON.stringify({
                type: "new_message",
                content: messageContent,
              })
            );
          }
        });
      }
    }
  })
  .catch((err) => {
    console.log(err);
  });
