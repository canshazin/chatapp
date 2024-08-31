const Sequelize = require("sequelize");

const sequelize = require("../util/database");
const Group = sequelize.define("Group", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  groupName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Group;
