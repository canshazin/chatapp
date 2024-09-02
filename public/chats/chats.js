const url = "http://localhost:3000";
if (!localStorage.getItem("page")) {
  localStorage.setItem("page", "1");
}

const msg_ul = document.querySelector("#msg_ul");
const send_form = document.querySelector("#msg_to_send_form");
const msg_input = document.querySelector("#msg_to_send");
const image_input = document.querySelector("#image_input");
const logout = document.querySelector("#logout");
const group_btn = document.querySelector("#group_btn");
const div2 = document.querySelector("#div2");
const all_member_btn = document.querySelector("#all_member_chats");
const logged_users_btn = document.querySelector("#logged_users");
let date_final = "";

all_member_btn.addEventListener("click", function (event) {
  event.preventDefault();
  dom_function_page1(event);
});

logged_users_btn.addEventListener("click", function (event) {
  event.preventDefault();
  dom_function_page3(event);
});

async function dom_function_page3(event) {
  try {
    localStorage.setItem("page", "3");
    div2.innerHTML = "";
    const msg_ul = document.createElement("ul");
    msg_ul.id = "msg_ul";
    div2.appendChild(msg_ul);
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

send_form.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log(image_input.files[0]);

  //send_msg(event);
});

async function send_msg(event) {
  event.preventDefault();
  const msg = msg_input.value;
  console.log(msg);
  send_form.reset();
  const user = "me";
  add_msg_to_ui(msg, user, new Date());
  await add_msg_to_db(msg);
}

async function add_msg_to_ui(msg, user, date = null) {
  try {
    const msg_ul =
      document.querySelector("#msg_ul") || document.createElement("ul");
    if (!msg_ul.id) {
      msg_ul.id = "msg_ul";
      div2.appendChild(msg_ul);
    }

    if (user === "middle" && date === null) {
      const user_span = document.createElement("span");

      user_span.textContent = msg;
      user_span.style.backgroundColor = "grey";
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
        const li = document.createElement("li");
        li.textContent = `${formatted_date}`;
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
async function add_msg_to_db(msg) {
  try {
    const result = await axios.post(
      `${url}/user/add/msg`,
      { msg: msg },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    console.log(result.data, "msg from db after adding to backend");
    const msg_append_to_local = result.data;
    const msg_from_local = JSON.parse(localStorage.getItem("msg"));
    const stringified_msg_to_local = JSON.stringify([
      ...msg_from_local,
      msg_append_to_local,
    ]);
    localStorage.setItem("msg", stringified_msg_to_local);
    console.log("updated in local");
  } catch (err) {
    console.log(err);
  }
}

window.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  const page = localStorage.getItem("page");
  if (!page) {
    console.log("no page but reloads page 1");
    dom_function_page1(event);
  } else {
    if (page == "1") {
      console.log("page1 reloads");
      dom_function_page1(event);
    }
    if (page == "2") {
      console.log("page 2 reloads");
      dom_function_page2(event);
    }
    if (page == "3") {
      console.log("page3 reloads");
      dom_function_page3(event);
    }
  }
});
async function dom_function_page1(event) {
  try {
    localStorage.setItem("page", "1");
    const msg_ul = document.querySelector("#msg_ul");
    //to clear data after switching from online users btn so that online users shouldnt be shown here top
    if (msg_ul) {
      msg_ul.innerHTML = "";
    }

    let id;
    let final_msg;
    const msg_local = localStorage.getItem("msg");
    if (!msg_local) {
      console.log(msg_local);
      id = -1;
      console.log(id, "id sent backend");
      const msgs = await axios.get(`${url}/get/messages/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log(msgs.data, "from backend");
      final_msg = msgs.data;
      localStorage.setItem("msg", JSON.stringify(msgs.data));
    } else {
      const parsed_local = JSON.parse(msg_local);
      console.log(parsed_local, "from local");
      const last_lement = parsed_local[parsed_local.length - 1];
      id = last_lement.id;
      console.log(id, "id sent backend");
      const msgs = await axios.get(`${url}/get/messages/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log(msgs.data, "from backend");
      final_msg = [...parsed_local, ...msgs.data];
    }
    console.log(final_msg, "final_msg_to display");

    final_msg.forEach((msg) => {
      console.log("to be displayed");
      console.log(msg.msg, msg.user.uname, msg.date);
      add_msg_to_ui(msg.msg, msg.user.uname, msg.date);
    });
    // msgs.data.forEach((msg) => {
    //   add_msg_to_ui(msg.msg, msg.user.uname, msg.date);
    // });
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
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
      localStorage.removeItem("page");
      localStorage.removeItem("msg");
      window.location.href = "../login/login.html";
    }
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
}

group_btn.addEventListener("click", function (event) {
  event.preventDefault();
  dom_function_page2(event);
});

async function dom_function_page2(event) {
  try {
    localStorage.setItem("page", "2");
    div2.style.overflow = "hidden";
    div2.innerHTML = "";

    // Create divLeft (25% width)
    const divLeft = document.createElement("div");
    divLeft.classList.add("div-left"); // Apply CSS class
    div2.appendChild(divLeft);

    // Create divRight (75% width)
    const divRight = document.createElement("div");
    divRight.classList.add("div-right"); // Apply CSS class
    div2.appendChild(divRight);

    // Create navbar within divRight
    const navbar = document.createElement("div");
    navbar.classList.add("navbar"); // Apply CSS class
    divRight.appendChild(navbar);

    // Example content in navbar
    const li = document.createElement("li");
    li.textContent = "hiiiii";
    navbar.appendChild(li);
    const li2 = document.createElement("li");
    li2.textContent = "hiiiii";
    divRight.appendChild(li2);
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
}
