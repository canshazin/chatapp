const entry_controller = require("../controllers/entry.js");
const reset_password_controller = require("../controllers/reset_password.js");
const chats_controller = require("../controllers/chats.js");
// const paypal_controller = require("../controllers/paypal.js");
// const premium_controller = require("../controllers/premium.js");
const misc_controller = require("../controllers/misc.js");
const middlewares = require("../middlewares/auth.js");
const upload = require("../middlewares/multer.js"); //middleware for img

const express = require("express");
const router = express.Router();

// Entry routes
router.post("/user/signup", entry_controller.signup);
router.post("/user/login", entry_controller.login);

// password reset routes
router.post(
  "/password/forgotpassword",
  reset_password_controller.forgot_password
);

router.get(
  "/password/resetpassword/:id",
  reset_password_controller.reset_password
);

router.post(
  "/password/resetpassword/updatepassword",
  reset_password_controller.update_password
);

// chats routes
router.get(
  "/get/users/online",
  middlewares.authenticate,
  chats_controller.get_users_online
);
router.post(
  "/user/add/msg",
  middlewares.authenticate,
  chats_controller.add_msg
);

router.get(
  "/get/messages/:id",
  middlewares.authenticate,
  chats_controller.get_msgs
);

//add img route
router.get(
  "/temp/save/img-db/:name",
  middlewares.authenticate,
  chats_controller.temp_save_img
);

router.post(
  "/s3/upload/img",
  middlewares.authenticate,
  upload.single("image"),
  chats_controller.upload_img
);

//group routes

router.get(
  "/user/create/group/:name",
  middlewares.authenticate,
  chats_controller.create_group
);
//dom content
router.get(
  "/user/get/groups/",
  middlewares.authenticate,
  chats_controller.get_groups
);

//delete group
router.get(
  "/user/delete/group/:id",
  middlewares.authenticate,
  chats_controller.delete_group
);

//get members to add to group
router.get(
  "/user/get/non-group-members/:id",
  middlewares.authenticate,
  chats_controller.get_non_group_members
);
//add member to group
router.get(
  "/add-user/to-group",
  middlewares.authenticate,
  chats_controller.add_member_to_group
); //get group members
router.get(
  "/get/group-members",
  middlewares.authenticate,
  chats_controller.get_group_members
);
//exit group
router.get(
  "/user/exit/group",
  middlewares.authenticate,
  chats_controller.exit_group
);

//remove goup member
router.get(
  "/remove/member/group",
  middlewares.authenticate,
  chats_controller.remove_member
);
//make member an admin
router.get(
  "/make/member/group-admin",
  middlewares.authenticate,
  chats_controller.make_admin
);
//group chats chats routes
router.post(
  "/user/add/grp-msg",
  middlewares.authenticate,
  chats_controller.add_grp_msg
);
router.get(
  "/get/group-messages/",
  middlewares.authenticate,
  chats_controller.get_grp_msgs
);
//add img to group
router.get(
  "/temp/save/grp-img-db/:gid",
  middlewares.authenticate,
  chats_controller.temp_save_grp_img
);

//logout
router.get("/user/logout", middlewares.authenticate, chats_controller.logout);

//
//
//
//
//
//
//

// get-add-delete routes
// router.get(
//   "/expense/getexpenses",
//   middlewares.authenticate,
//   expense_controller.get_expenses
// );

// router.post(
//   "/expense/addexpense",
//   middlewares.authenticate,
//   expense_controller.add_expense
// );

// router.get(
//   "/expense/deleteexpense/:id",
//   middlewares.authenticate,
//   expense_controller.delete_expense
// );

// Paypal routes
// router.get(
//   "/purchase/premium-membership",
//   middlewares.authenticate,
//   paypal_controller.purchase_premium
// );

// router.post(
//   "/purchase/premium-membership/update",
//   middlewares.authenticate,
//   paypal_controller.update
// );

// Premium routes
// router.get(
//   "/premium/leaderboard",
//   middlewares.authenticate,
//   premium_controller.leaderboard
// );

// router.get(
//   "/premium/report/view/:date",
//   middlewares.authenticate,
//   premium_controller.view_report
// );

// router.get(
//   "/premium/download",
//   middlewares.authenticate,
//   premium_controller.download_expenses
// );

// router.post(
//   "/premium/download/history/save",
//   middlewares.authenticate,
//   premium_controller.download_history_save
// );

// router.get(
//   "/premium/download/history/get",
//   middlewares.authenticate,
//   premium_controller.download_history_get
// );

// home and invalid routes
router.get("/", misc_controller.HomePage);

router.use("/", misc_controller.pageNotFound);

module.exports = router;
