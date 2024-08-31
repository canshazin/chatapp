const url = "http://localhost:3000";
console.log("start of chat script");
const msg_ul = document.querySelector("#msg_ul");
const send_form = document.querySelector("#msg_to_send_form");
const msg_input = document.querySelector("#msg_to_send");
const logout = document.querySelector("#logout");
const group_btn = document.querySelector("#group_btn");
const div2 = document.querySelector("#div2");
const all_member_btn = document.querySelector("#all_member_chats");
const logged_users_btn = document.querySelector("#logged_users");
const group_ul = document.querySelector("#group_ul");
const members_ul = document.querySelector("#members_ul");
const create_group_btn = document.querySelector("#create_group_btn");
const create_group_form = document.querySelector("#create_group_form");
const divLeft = document.querySelector("#divLeft");
const divRight = document.querySelector("#divRight");
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
  try {
    const groups = await axios.get(`${url}/user/get/groups/`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(groups.data);
    groups.data.forEach((group) => {
      add_group_to_ui(group.groupName, group.id);
    });
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
}

function add_group_to_ui(name, id) {
  const li = document.createElement("li");
  li.textContent = `${name}`;
  li.dataset.grp_id = id;
  li.id = `_${id}`;

  li.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      navbar.dataset.nav_grp_id = li.dataset.grp_id;
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
    if (result.data.success == true) {
      console.log("delted successfully");

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

function view_members_ui(id, name, mobile, email, member_admin, admin) {
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

    if (member_admin == false) {
      const make_admin_btn = document.createElement("button");
      make_admin_btn.textContent = "Make Admin";
      make_admin_btn.id = `_${email}`;
      make_admin_btn.dataset.email = email;
      make_admin_btn.dataset.grp_id = id;
      li.appendChild(make_admin_btn);
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
        result.data.admin
      );
    });
  } catch (err) {
    console.log(err);
    alert("smthing wrong");
  }
});

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
