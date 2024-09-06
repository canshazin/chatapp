const url = "http://13.201.78.180:3000";
console.log("start of chat script");
const msg_ul = document.querySelector("#msg_ul");
const send_form = document.querySelector("#msg_to_send_form");
const msg_input = document.querySelector("#msg_to_send");
const logout = document.querySelector("#logout");
const group_btn = document.querySelector("#group_btn");
const div2 = document.querySelector("#div2");
const all_member_btn = document.querySelector("#all_member_chats");
const logged_users_btn = document.querySelector("#logged_users");

let date_final = "";

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
      const div2 = document.getElementById("div2");
      div2.scrollTop = div2.scrollHeight;
    }
  } catch (err) {
    console.log(err);
  }
}

window.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  dom_function(event);
});
async function dom_function(event) {
  try {
    const users_online = await axios.get(`${url}/get/users/online`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(users_online.data);

    users_online.data.forEach((user) => {
      add_msg_to_ui(`${user.uname} Logged in`, "middle");
    });
  } catch (err) {
    console.error("Error in dom_function_page3:", err);
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
      localStorage.removeItem("msg_g");
      localStorage.removeItem("grp");
      window.location.href = "../login/login.html";
    }
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
}
all_member_btn.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../allChats/allChats.html";
});
group_btn.addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "../group/group.html";
});
