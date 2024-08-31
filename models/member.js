const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Member = sequelize.define("member", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admin: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Member;
