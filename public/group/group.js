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

let date_final = "";

window.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  dom_function(event);
});

async function dom_function(event) {
  try {
    const divLeft = document.querySelector("#divLeft");

    const divRight = document.querySelector("#divRight");

    const navbar = document.querySelector("#navbar");

    // Example content in navbar
    const li = document.createElement("li");
    li.textContent = "hiiiii";
    navbar.appendChild(li);
    const li2 = document.createElement("li");
    li2.textContent = "hiiiii";
    // divRight.appendChild(li2);
    msg_ul.appendChild(li2);
    const li3 = document.createElement("li");
    li3.textContent = "hiiiii";
    group_ul.appendChild(li3);
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
}

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
