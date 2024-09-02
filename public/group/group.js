const url = "http://localhost:3000";
console.log("start of chat script");
const msg_ul = document.querySelector("#msg_ul");
const send_form = document.querySelector("#msg_to_send_form");
const msg_input = document.querySelector("#msg_to_send");
const logout = document.querySelector("#logout");
const group_btn = document.querySelector("#group_btn");
const div2 = document.querySelector("#div2");
const send_btn = document.querySelector("#send_btn");
const all_member_btn = document.querySelector("#all_member_chats");
const logged_users_btn = document.querySelector("#logged_users");
const group_ul = document.querySelector("#group_ul");
const members_ul = document.querySelector("#members_ul");
const create_group_btn = document.querySelector("#create_group_btn");
const create_group_form = document.querySelector("#create_group_form");
const divLeft = document.querySelector("#div-left");
const divRight = document.querySelector("#div-right");
const navbar = document.querySelector("#navbar");
const delete_btn = document.querySelector("#delete_btn");
const add_member_btn = document.querySelector("#add_member_btn");
const grp_name_navbar = document.querySelector("#grp_name_navbar");
const exit_btn = document.querySelector("#exit_btn");
const view_members_btn = document.querySelector("#view_members_btn");
const search_bar = document.querySelector("#search_bar");

let date_final = "";

window.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();

  dom_function(event);
});

async function dom_function(event) {
  event.preventDefault();
  try {
    const groups = await axios.get(`${url}/user/get/groups/`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(groups.data);
    groups.data.forEach((group) => {
      console.log(group.groupName, group.id);
      add_group_to_ui(group.groupName, group.id);
    });
    //this onward to load chat page(not chats tho) if grp id  is der in local storage
    const local_grp_id = localStorage.getItem("grp");
    console.log(local_grp_id);

    if (local_grp_id) {
      const listItems = group_ul.querySelectorAll("li");
      console.log(listItems);

      listItems.forEach((li) => {
        console.log(li.dataset.grp_id);
        if (li.dataset.grp_id == local_grp_id) {
          console.log(li.dataset.grp_id, local_grp_id);
          li.click();
        }
      });
      //till here to load only chats page as mentioned in previous comment
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
}

function add_group_to_ui(name, id) {
  console.log("hiiiii");
  const li = document.createElement("li");
  li.textContent = `${name}`;
  li.dataset.grp_id = id;
  li.id = `_${id}`;

  li.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      //1....check if already diffreent group id exist..then remove that groups chats
      msg_ul.innerHTML = "";
      if (localStorage.getItem("grp")) {
        if (localStorage.getItem("grp") != li.dataset.grp_id) {
          if (localStorage.getItem("msg_g")) {
            console.log("deleted old local msgs");
            localStorage.removeItem("msg_g");
          }
        }
      }
      //1.... end here
      localStorage.setItem("grp", li.dataset.grp_id);
      let id; //from which index onwards we need msg from backend
      let final_msg;
      const msg_local = localStorage.getItem("msg_g");
      if (!msg_local) {
        console.log(msg_local);
        id = -1;
        console.log(id, "id sent backend");
        const msgs = await axios.get(
          `${url}/get/group-messages?id=${id}&grp_id=${localStorage.getItem(
            "grp"
          )}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log(msgs.data, "from backend");

        final_msg = msgs.data;
        console.log("msgd from backend is here.....", final_msg);
        if (final_msg.length > 0) {
          localStorage.setItem("msg_g", JSON.stringify(msgs.data));
        }
      } else {
        const parsed_local = JSON.parse(msg_local);
        console.log(parsed_local, "from local");
        const last_lement = parsed_local[parsed_local.length - 1];
        id = last_lement.id;
        console.log(id, "id sent backend");
        const msgs = await axios.get(
          `${url}/get/group-messages?id=${id}&grp_id=${localStorage.getItem(
            "grp"
          )}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log(msgs.data, "from backend");
        final_msg = [...parsed_local, ...msgs.data];
      }
      console.log(final_msg, "final_msg_to display");

      final_msg.forEach((msg) => {
        console.log("to be displayed");
        console.log(msg.msg, msg.user.uname, msg.date);
        add_msg_to_ui(msg.msg, msg.user.uname, msg.date);
      });

      send_btn.dataset.grp_id = li.dataset.grp_id;
      navbar.dataset.nav_grp_id = li.dataset.grp_id;
      msg_to_send_form.style.visibility = "visible";
      console.log(navbar.dataset.nav_grp_id);
      search_bar.style.visibility = "hidden";
      members_ul.innerHTML = "";
      grp_name_navbar.textContent = name;
      grp_name_navbar.style.visibility = "visible";
      delete_btn.style.visibility = "visible";
      add_member_btn.style.visibility = "visible";
      view_members_btn.style.visibility = "visible";
      exit_btn.style.visibility = "visible";

      console.log("trying to chat in group ", id);
    } catch (err) {
      console.log(err);
      alert("smthing went wrong");
    }
  });
  group_ul.appendChild(li);
  console.log("added li group");
}
delete_btn.addEventListener("click", async (event) => {
  try {
    console.log(
      "deleting handler//grp id from nav==",
      event.target.parentElement.dataset.nav_grp_id
    );
    const id = event.target.parentElement.dataset.nav_grp_id;

    const result = await axios.get(`${url}/user/delete/group/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    members_ul.innerHTML = "";

    localStorage.removeItem("msg_g");
    localStorage.removeItem("grp");
    if (result.data.success == true) {
      console.log("deleted successfully");
      msg_ul.innerHTML = "";

      const li = group_ul.querySelector(`#_${id}`);
      li.remove();
      delete_btn.style.visibility = "hidden";
      add_member_btn.style.visibility = "hidden";
      view_members_btn.style.visibility = "hidden";
      exit_btn.style.visibility = "hidden";
      grp_name_navbar.style.visibility = "hidden";

      if (
        localStorage.getItem("grp_msg") &&
        localStorage.getItem("grp") == id
      ) {
        localStorage.removeItem("grp_msg");
        localStorage.removeItem("grp");
        console.log("removed item from local storage group");
      }
    } else if (result.data.success == false && result.data.sadmin == false) {
      alert("You are not Super admin");
    }
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
});

exit_btn.addEventListener("click", async function (event) {
  event.preventDefault();
  const result = await axios.get(
    `${url}/user/exit/group?gid=${event.target.parentElement.dataset.nav_grp_id}`,
    {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    }
  );
  if (result.data.success == true) {
    console.log(" have exited the group");
    window.location.reload();
  }
});

create_group_form.addEventListener("submit", function (event) {
  event.preventDefault();
  create_group(event);
});
async function create_group(event) {
  try {
    console.log(event);
    const group_name = document.querySelector("#group_name").value;
    console.log(group_name);

    const result = await axios.get(`${url}/user/create/group/${group_name}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(result.data);
    add_group_to_ui(group_name, result.data.id);
  } catch (err) {
    alert("smthing went wrong");
    console.log(err);
  }
}

add_member_btn.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    msg_ul.innerHTML = "";
    const id = event.target.parentElement.dataset.nav_grp_id;

    const admin = await axios.get(`${url}/user/get/non-group-members/${id}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (admin.data.admin === true) {
      console.log(admin.data);
      search_bar.style.visibility = "visible";
      search_bar.value = "";
      members_ul.innerHTML = "";
      members_ul.style.visibility = "hidden";
      admin.data.members_not_in_group.forEach((member) => {
        add_members_to_ui(id, member.uname, member.mobile, member.email); //group id is id
      });
    } else {
      alert("You are not an admin");
    }
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
});

function view_members_ui(
  id,
  name,
  mobile,
  email,
  member_admin,
  admin,
  user_email = null
) {
  //member admin is admin status of each user while admin is of current user logged in
  const li = document.createElement("li");
  li.id = `_${id}`;
  li.dataset.grp_id = id;
  const username_span = document.createElement("span");
  const mobile_span = document.createElement("span");
  const email_span = document.createElement("span");

  username_span.textContent = `Name: ` + name;
  mobile_span.textContent = `Mobile: ` + mobile;
  email_span.textContent = `Email: ` + email;

  // username_span.className = "username";
  // mobile_span.className = "mobile";
  // email_span.className = "email";

  li.appendChild(username_span);

  li.appendChild(mobile_span);
  li.appendChild(email_span);
  if (admin == true) {
    console.log("true admin");
    const remove_member_btn = document.createElement("button");
    remove_member_btn.textContent = "Remove";
    remove_member_btn.id = `_${email}`;
    remove_member_btn.dataset.email = email;
    remove_member_btn.dataset.grp_id = id;
    li.appendChild(remove_member_btn);

    remove_member_btn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        console.log("remove event listener1");
        const result = await axios.get(
          `${url}/remove/member/group?email=${event.target.dataset.email}&gid=${event.target.dataset.grp_id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log("remove event listener2");
        console.log(result);
        if (result.data.success == false) {
          alert(result.data.msg);
        } else if (result.data.success == true) {
          console.log("removed successfully");
          event.target.parentElement.remove();
        }
      } catch (err) {
        console.log(err);
        alert("smthing went wrong");
      }
    });

    const make_admin_btn = document.createElement("button");
    make_admin_btn.textContent = "Make Admin";
    make_admin_btn.id = `_${email}`;
    make_admin_btn.dataset.email = email;
    make_admin_btn.dataset.grp_id = id;
    li.appendChild(make_admin_btn);
    if (member_admin == true) {
      make_admin_btn.style.visibility = "hidden";
    }
    if (user_email == email) {
      remove_member_btn.style.visibility = "hidden";
      make_admin_btn.style.visibility = "hidden";
    }
    make_admin_btn.addEventListener("click", async (event) => {
      event.preventDefault();
      try {
        console.log("make admin event listener1");
        const result = await axios.get(
          `${url}/make/member/group-admin?email=${event.target.dataset.email}&gid=${event.target.dataset.grp_id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log("make admin event listener2");
        console.log(result);
        if (result.data.success == true) {
          console.log("successfully made admin");
          event.target.remove();
        }
      } catch (err) {
        console.log(err);
        alert("smthing went wrong");
      }
    });
  }

  members_ul.appendChild(li);
}

function add_members_to_ui(id, name, mobile, email) {
  const li = document.createElement("li");
  li.id = `_${id}`;
  li.dataset.grp_id = id;
  const username_span = document.createElement("span");
  const mobile_span = document.createElement("span");
  const email_span = document.createElement("span");

  username_span.textContent = `Name: ` + name;
  mobile_span.textContent = `Mobile: ` + mobile;
  email_span.textContent = `Email: ` + email;

  // username_span.className = "username";
  // mobile_span.className = "mobile";
  // email_span.className = "email";

  li.appendChild(username_span);

  li.appendChild(mobile_span);
  li.appendChild(email_span);
  const add_grp_btn = document.createElement("button");
  add_grp_btn.textContent = "Add To Group";
  add_grp_btn.id = `_${email}`;
  add_grp_btn.dataset.email = email;
  add_grp_btn.dataset.grp_id = id;
  li.appendChild(add_grp_btn);
  members_ul.appendChild(li);

  add_grp_btn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const result = await axios.get(
        `${url}/add-user/to-group?email=${event.target.dataset.email}&gid=${event.target.dataset.grp_id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.success == true) {
        console.log("added successfully to group");
        event.target.parentElement.remove();
      }
    } catch (err) {
      alert("smthing wrong");
      console.log(err);
    }
  });
}

search_bar.addEventListener("keyup", function () {
  members_ul.style.visibility = "visible";
  const searchString = this.value.toLowerCase();
  if (search_bar.value == "") {
    members_ul.style.visibility = "hidden";
  }
  const listItems = members_ul.querySelectorAll("li");

  listItems.forEach((li) => {
    const username = li
      .querySelector("span:nth-child(1)")
      .textContent.toLowerCase();
    const mobile = li
      .querySelector("span:nth-child(2)")
      .textContent.toLowerCase();
    const email = li
      .querySelector("span:nth-child(3)")
      .textContent.toLowerCase();

    const matchesSearch =
      username.includes(searchString) ||
      mobile.includes(searchString) ||
      email.includes(searchString);

    li.style.display = matchesSearch ? "" : "none";
  });
});

view_members_btn.addEventListener("click", async (event) => {
  try {
    const result = await axios.get(
      `${url}/get/group-members?id=${event.target.parentElement.dataset.nav_grp_id}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    console.log(result.data);
    members_ul.innerHTML = "";
    msg_ul.innerHTML = "";
    members_ul.style.visibility = "visible";
    search_bar.style.visibility = "hidden";
    result.data.final_members.forEach((member) => {
      console.log(member);
      view_members_ui(
        event.target.parentElement.dataset.nav_grp_id,
        member.uname,
        member.mobile,
        member.email,
        member.admin,
        result.data.admin,
        member.user_email
      );
    });
  } catch (err) {
    console.log(err);
    alert("smthing wrong");
  }
});

//all chats code below
//
send_form.addEventListener("submit", function (event) {
  event.preventDefault();
  send_msg(event);
});
async function send_msg(event) {
  event.preventDefault();
  const msg = msg_input.value;
  console.log(msg);

  const user = "me";
  add_msg_to_ui(msg, user, new Date());
  // console.log(event.target.send_btn.dataset.grp_id);
  add_msg_to_db(msg, event.target.send_btn.dataset.grp_id);
  image_input.value = "";
  msg_input.value = ""; 
}
async function add_msg_to_ui(msg, user, date = null) {
  try {
    if (user == "middle" && date == null) {
      //for online users
      const user_span = document.createElement("span");

      user_span.textContent = msg;
      user_span.style.backgroundColor = "grey";
      console.log(user_span.style.backgroundColor);
      const li = document.createElement("li");
      li.appendChild(user_span);
      li.className = "middle";
      msg_ul.appendChild(li);
    } else {
      // Create a Date object from the UTC date string
      const utc_date = new Date(date);

      // IST offset: UTC+5:30
      const offset_hours = 5;
      const offset_minutes = 30;

      // Calculate the total offset in milliseconds
      const offset_milliseconds =
        offset_hours * 60 * 60 * 1000 + offset_minutes * 60 * 1000;

      // Convert the UTC date to IST by adding the offset
      const india_date_milliseconds = utc_date.getTime() + offset_milliseconds;

      // Create a new Date object for IST
      const india_date = new Date(india_date_milliseconds);

      // Extract and format the date and time components
      const day = india_date.getUTCDate();
      const month = india_date.getUTCMonth() + 1; // Months are zero-based
      const year = india_date.getUTCFullYear();

      const hours = india_date.getUTCHours();
      const minutes = india_date.getUTCMinutes();
      const seconds = india_date.getUTCSeconds();

      // Format the date and time
      const formatted_date = `${day.toString().padStart(2, "0")}-${month
        .toString()
        .padStart(2, "0")}-${year}`;
      const formatted_time = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      if (date_final == "" || date_final !== formatted_date) {
        const date_span = document.createElement("span");

        date_span.textContent = `${formatted_date}`;
        date_span.style.backgroundColor = "grey";
        const li = document.createElement("li");
        li.appendChild(date_span);
        li.className = "middle";
        date_final = formatted_date;
        msg_ul.appendChild(li);
      }

      const li = document.createElement("li");
      const username_span = document.createElement("span");
      const message_span = document.createElement("span");
      const time_span = document.createElement("span");

      username_span.textContent = user;
      message_span.textContent = msg;
      time_span.textContent = formatted_time;

      username_span.className = "username";
      message_span.className = "message";
      time_span.className = "time";

      li.appendChild(username_span);

      li.appendChild(message_span);
      li.appendChild(time_span);
      if (user == "me") {
        li.className = user;
      } else {
        li.className = "other";
      }
      msg_ul.appendChild(li);

      divRight.scrollTop = divRight.scrollHeight;
    }
  } catch (err) {
    console.log(err);
  }
}

async function add_msg_to_db(msg, grp_id) {
  try {
    console.log("required grpid in add_msg_to_db function", grp_id);
    const result = await axios.post(
      `${url}/user/add/grp-msg`,
      { msg: msg, grp_id: grp_id },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    console.log(result.data, "msg from db after adding to backend");
    const msg_append_to_local = result.data;
    const msg_from_local = JSON.parse(localStorage.getItem("msg_g"));
    const stringified_msg_to_local = JSON.stringify([
      ...msg_from_local,
      msg_append_to_local,
    ]);
    localStorage.setItem("msg_g", stringified_msg_to_local);
    console.log("updated in local");
  } catch (err) {
    console.log(err);
  }
}

//
//

logout.addEventListener("click", async function (event) {
  logout_function(event);
});
async function logout_function(event) {
  try {
    const result = await axios.get(`${url}/user/logout`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(result);
    if (result.data.success == true) {
      localStorage.removeItem("token");
      localStorage.removeItem("msg");
      window.location.href = "../login/login.html";
    }
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
}
logged_users_btn.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../onlineUsers/onlineUsers.html";
});
all_member_btn.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../allChats/allChats.html";
});
