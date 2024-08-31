const User = require("../models/user.js");
const Message = require("../models/message.js");
const sequelize = require("../util/database.js");
const Group = require("../models/group.js");
const Grp_message = require("../models/grp_message");
const Member = require("../models/member");
const { Op } = require("sequelize");

exports.get_users_online = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { online: true },
      attributes: ["uname"],
    });
    const users_online = users.filter((user) => user.uname !== req.user.uname);
    res.json(users_online);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.add_msg = async (req, res, next) => {
  try {
    const msg = req.body.msg;
    const result = await Message.create({
      msg: msg,
      date: new Date(),
      userId: req.user.id,
    });
    res.json({
      id: result.id,
      msg: result.msg,
      date: result.date,
      user: { uname: "me" },
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.get_msgs = async (req, res, next) => {
  try {
    const result = await Message.findAll({
      attributes: ["id", "msg", "date"],
      include: [
        {
          model: User,
          attributes: ["uname"],
        },
      ],
      where: {
        id: {
          [Op.gt]: req.params.id, // Fetch messages with id greater than req.params.id
        },
      },
      order: [["date", "ASC"]], // Assuming you want to order by message creation time
    });

    result.map((msg) => {
      if (msg.user.uname == req.user.uname) {
        msg.user.uname = "me";
      }
    });
    console.log(result);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.create_group = async (req, res, next) => {
  try {
    const result = await Group.create({ groupName: req.params.name });
    console.log("dddddddddddddddd", result.id, "dddddddddddddddddd");
    const result2 = await Member.create({
      userId: req.user.id,
      groupId: result.id,
      admin: "s",
    });

    res.json({ id: result.id });
  } catch (err) {
    console.log(err);
  }
};
exports.get_groups = async (req, res, next) => {
  try {
    const members = await Member.findAll({
      attributes: ["groupId"],
      where: { userId: req.user.id },
    });

    const group_ids = members.map((member) => member.groupId);
    const groups = await Group.findAll({
      attributes: ["id", "groupName"],
      where: {
        id: group_ids, // Use the array of group IDs to filter the results
      },
    });

    res.json(groups);
  } catch (err) {
    console.log(err);
  }
};

exports.delete_group = async (req, res, next) => {
  try {
    const check_admin = await Member.findOne({
      attributes: ["admin"],
      where: { userId: req.user.id, groupId: req.params.id },
    });
    if (check_admin.admin === "s") {
      await Grp_message.destroy({ where: { groupId: req.params.id } });
      await Group.destroy({ where: { id: req.params.id } });
      await Member.destroy({ where: { groupId: req.params.id } });
      res.json({ success: true, sadmin: true });
    } else {
      res.json({ success: false, sadmin: false });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.get_non_group_members = async (req, res, next) => {
  try {
    const check_admin = await Member.findOne({
      attributes: ["admin"],
      where: { userId: req.user.id, groupId: req.params.id },
    });
    if (check_admin.admin === "s" || check_admin.admin === "a") {
      const members_in_group = await Member.findAll({
        attributes: ["userId"],
        where: { groupId: req.params.id },
      });

      const user_ids_in_group = members_in_group.map((member) => member.userId);
      const members_not_in_group = await User.findAll({
        attributes: ["uname", "mobile", "email"],
        where: {
          id: {
            [Op.notIn]: user_ids_in_group, // Exclude userIds that are in the group
          },
        },
      });

      res.json({ members_not_in_group, admin: true });
    } else {
      res.json({ admin: false });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.add_member_to_group = async (req, res, next) => {
  try {
    const { gid, email } = req.query;
    console.log(gid, email);
    const req_user = await User.findOne({ where: { email: email } });
    if (req_user) {
      const grp_member = await Member.create({
        groupId: gid,
        userId: req_user.id,
        admin: "n",
      });
      res.json({ success: true });
    } else {
      throw err;
    }
  } catch (err) {
    console.log(err);
  }
};

exports.get_group_members = async (req, res, next) => {
  try {
    const gid = req.query.id;
    let admin_status;
    const check_admin = await Member.findOne({
      attributes: ["admin"],
      where: { userId: req.user.id, groupId: gid },
    });
    if (check_admin.admin === "s" || check_admin.admin === "a") {
      admin_status = true;
    } else {
      admin_status = false;
    }
    //  Get members in the group with their admin status
    const members_in_group = await Member.findAll({
      attributes: ["userId", "admin"],
      where: { groupId: gid },
    });

    // Get the user IDs from the members
    const user_ids_in_group = members_in_group.map((member) => member.userId);

    //  Retrieve user details for those IDs
    const req_members = await User.findAll({
      attributes: ["id", "uname", "mobile", "email"], // Include "id" to match with member data
      where: {
        id: user_ids_in_group,
      },
    });

    // Merge the user data with the admin status
    const final_members = req_members.map((user) => {
      const memberData = members_in_group.find(
        (member) => member.userId === user.id
      );
      return {
        uname: user.uname,
        mobile: user.mobile,
        email: user.email,
        admin: memberData
          ? memberData.admin === "s" || memberData.admin === "a"
          : false, // Check for admin status
      };
    });

    // Now final_members will contain the desired output
    console.log(final_members);

    res.json({ final_members, admin: admin_status });
  } catch (err) {
    console.log(err);
  }
};

exports.exit_group = async (req, res, next) => {
  try {
    const gid = req.query.gid;
    await Member.destroy({ where: { userId: req.user.id, groupId: gid } });
    res.json({ success: true });
  } catch (err) {
    console.log(err);
  }
};
exports.remove_member = async (req, res, next) => {
  try {
    const { email, gid } = req.query;
    const user_to_be_removed = await User.findOne({ where: { email: email } });
    const check_admin = await Member.findOne({
      attributes: ["admin"],
      where: { userId: user_to_be_removed.id, groupId: gid },
    });
    if (check_admin.admin === "s") {
      return res.json({ success: false, msg: "You cant remove super admin" });
    } else {
      await Member.destroy({
        where: { userId: user_to_be_removed.id, groupId: gid },
      });
      res.json({ success: true });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.make_admin = async (req, res, next) => {
  try {
    const { email, gid } = req.query;
    const user_to_be_admin = await User.findOne({ where: { email: email } });
    await Member.update(
      { admin: "a" },
      {
        where: {
          userId: user_to_be_admin.id,
          groupId: gid,
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await User.update({ online: false }, { where: { email: req.user.email } });
    res.json({ success: true });
  } catch (err) {
    console.log(err);
  }
};

//
//
//
//
//
//
//
//
//

// exports.add_expense = async (req, res, next) => {
//   const t = await sequelize.transaction();
//   try {
//     let msg = "";
//     const expense = req.body;

//     const expense_added = await Expense.create(
//       {
//         date: expense.date,
//         amount: expense.amount,
//         category: expense.category,
//         description: expense.description,
//         userId: req.user.id,
//       },
//       { transaction: t }
//     );

//     const new_total_expense =
//       Number(expense.amount) + Number(req.user.total_expense);
//     await User.update(
//       { total_expense: new_total_expense },
//       {
//         where: { id: req.user.id },
//         transaction: t,
//       }
//     );
//     await t.commit();
//     msg = "expense added succefully";
//     const id = expense_added.id;

//     const response = { msg, id };
//     res.json(response);
//   } catch (err) {
//     await t.rollback();

//     console.error(err);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding the expense" });
//   }
// };

// exports.get_expenses = async (req, res) => {
//   try {
//     const items_per_page = parseInt(req.query.items_per_page, 10) || 5;
//     const page = parseInt(req.query.page, 10) || 1;
//     let prime = req.user.isPrime || false;
//     const { count, rows: expenses } = await Expense.findAndCountAll({
//       where: { userId: req.user.id },
//       offset: (page - 1) * items_per_page,
//       limit: items_per_page,
//     });
//     res.json({
//       expenses,
//       prime,
//       current_page: page,
//       has_next_page: items_per_page * page < count,
//       next_page: items_per_page * page < count ? page + 1 : null,
//       has_previous_page: page > 1,
//       previous_page: page > 1 ? page - 1 : null,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Server Error");
//   }
// };

// exports.delete_expense = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const id = req.params.id;
//     const expense_to_delete = await Expense.findOne(
//       {
//         where: { id: id, userId: req.user.id },
//       },
//       { transaction: t }
//     );

//     const expense = await Expense.destroy(
//       {
//         where: { id: id, userId: req.user.id },
//       },
//       { transaction: t }
//     );
//     const new_total_expense =
//       Number(req.user.total_expense) - Number(expense_to_delete.amount);
//     await User.update(
//       { total_expense: new_total_expense },
//       {
//         where: { id: req.user.id },
//       },
//       { transaction: t }
//     );
//     await t.commit();
//     res.json({ success: true });
//   } catch (err) {
//     await t.rollback();
//     console.log(err);
//   }
// };
