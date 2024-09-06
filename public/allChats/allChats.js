const url = "http://13.201.78.180:3000";
console.log("start of chat script");
const msg_ul = document.querySelector("#msg_ul");
const send_form = document.querySelector("#msg_to_send_form");
const msg_input = document.querySelector("#msg_to_send");
const image_input = document.querySelector("#image_input");
const logout = document.querySelector("#logout");
const group_btn = document.querySelector("#group_btn");
const div2 = document.querySelector("#div2");
const all_member_btn = document.querySelector("#all_member_chats");
const logged_users_btn = document.querySelector("#logged_users");
const ws = new WebSocket("ws://13.201.78.180:3000");

let date_final = "";

msg_input.addEventListener("focus", function () {
  image_input.value = "";
  const list = msg_ul.querySelectorAll("li");
  console.log(list);

  list.forEach((li) => {
    if (li.dataset.upload) {
      if (li.dataset.upload == true) {
        console.log(true);
        alert("image being uploaded");
      }
    }
  });
  console.log(list);
});

// Event listener for the image input
image_input.addEventListener("focus", function () {
  msg_input.value = ""; // Clear the text input when the image input is clicked
});
send_form.addEventListener("submit", function (event) {
  event.preventDefault();
  send_msg(event);
});
async function send_msg(event) {
  event.preventDefault();

  const msg = msg_input.value;
  const file = image_input.files[0];
  const user = "me";
  if (file) {
    // add_msg_to_ui(image_url, user, "img", new Date());
    console.log("img exist");

    s3_bucket(file, user);
  } else if (msg) {
    const date = new Date();
    add_msg_to_ui(msg, user, "text", date);
    add_msg_to_db(msg, "text");
    ws.send(
      JSON.stringify({
        type: "send_message",
        content: {
          msg,
          type: "text",
          user: localStorage.getItem("token"),
          date,
        },
      })
    );
  }
  console.log(msg);

  image_input.value = "";
  msg_input.value = "";
}

async function s3_bucket(file, user) {
  try {
    console.log("fake_name", "file....");

    if (file) {
      //initially putting tempory database update
      const temp_data = await axios.get(
        `${url}/temp/save/img-db/${"fake_name"}`, // Use a proper ID if needed
        // Use formData
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const temp_id = temp_data.data.id;
      console.log(temp_data.data, "temp data");
      const msg_append_to_local = temp_data.data;
      const msg_from_local = JSON.parse(localStorage.getItem("msg"));
      console.log("msg from local", msg_from_local);
      let stringified_msg_to_local;
      if (msg_from_local != null) {
        stringified_msg_to_local = JSON.stringify([
          ...msg_from_local,
          msg_append_to_local,
        ]);
      } else {
        stringified_msg_to_local = JSON.stringify([msg_append_to_local]);
      }

      localStorage.setItem("msg", stringified_msg_to_local);
      console.log("updated in local");

      const reader = new FileReader();

      reader.onload = async function (e) {
        // Create a list item
        const li = document.createElement("li");
        const username_span = document.createElement("span");
        const message_span = document.createElement("span");
        const time_span = document.createElement("span");
        const uploading_in_process_span = document.createElement("span");
        const img = document.createElement("img");

        // Set preview image
        img.src = e.target.result;
        img.style.maxWidth = "100px";

        // Set other spans
        username_span.textContent = user; // Set username
        uploading_in_process_span.textContent = "uploading image...";

        message_span.appendChild(img);
        time_span.textContent = new Date().toLocaleTimeString(); // Set current time

        // Add classes
        username_span.className = "username";
        message_span.className = "message";
        uploading_in_process_span.className = "time";
        time_span.className = "time";

        // Append elements to list item
        li.appendChild(username_span);
        li.appendChild(message_span);

        li.appendChild(uploading_in_process_span);
        li.appendChild(time_span);
        li.className = "me";
        div2.scrollTop = div2.scrollHeight;
        // Append list item to the list
        msg_ul.appendChild(li);

        // Now upload the image and get the URL
        const formData = new FormData();
        formData.append("image", file);
        const gid = -1;
        console.log("temp______Date", temp_data);
        const result = await axios.post(
          `${url}/s3/upload/img?gid=${gid}&temp_id=${temp_id}&date=${temp_data.data.date}`, // Use a proper ID if needed
          formData, // Use formData
          {
            headers: {
              Authorization: localStorage.getItem("token"),
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(result.data);
        ws.send(
          JSON.stringify({
            type: "send_message",
            content: {
              msg: result.data.msg,
              type: "img",
              user: localStorage.getItem("token"),
              date: temp_data.data.date,
            },
          })
        );

        const image_url = result.data.msg; // Correct property name
        img.src = image_url; // Update image src with URL from backend

        uploading_in_process_span.style.display = "none";

        const msg_from_local = JSON.parse(localStorage.getItem("msg"));
        console.log(msg_from_local, "msg from local");
        msg_from_local.forEach((one_local_msg) => {
          // Check if the id matches
          console.log(one_local_msg.msg);
          if (one_local_msg.id == result.data.id) {
            // Update the properties of the object

            one_local_msg.msg = result.data.msg;
            one_local_msg.type = result.data.type;
            one_local_msg.date = result.data.date;

            // Assuming user is an object with nested properties
            one_local_msg.user.uname = "me";

            // Add more properties as needed
          }
        });
        console.log("this is local doubt area", msg_from_local);
        const stringified_msg_to_local = JSON.stringify([...msg_from_local]);
        localStorage.setItem("msg", stringified_msg_to_local);
        console.log("updated in local");

        // add_msg_to_db(image_url, "img"); //incase u refresh whil euploading and backend uploading fails from s3controller or upload controller
        img.addEventListener("click", () => {
          var a = document.createElement("a");
          a.href = image_url;
          a.target = "_blank";
          a.click();
        });
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
}

async function add_msg_to_ui(msg, user, type, date) {
  try {
    console.log("add to ui called");

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
    // const formatted_time = `${hours.toString().padStart(2, "0")}:${minutes
    //   .toString()
    //   .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const formatted_time = new Date(date).toLocaleTimeString();

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
    if (type == "text") {
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
    } else if (type == "img") {
      const username_span = document.createElement("span");
      const message_span = document.createElement("span");
      const time_span = document.createElement("span");
      const img = document.createElement("img");
      img.src = msg;
      img.style.maxWidth = "100px";
      username_span.textContent = user;
      message_span.appendChild(img);
      time_span.textContent = formatted_time;

      username_span.className = "username";
      message_span.className = "message";
      time_span.className = "time";

      li.appendChild(username_span);

      li.appendChild(message_span);
      li.appendChild(time_span);
      img.addEventListener("click", () => {
        var a = document.createElement("a");
        a.href = msg;
        a.target = "_blank";
        a.click();
      });
    }
    if (user == "me") {
      li.className = user;
    } else {
      li.className = "other";
    }
    msg_ul.appendChild(li);
    const div2 = document.getElementById("div2");
    div2.scrollTop = div2.scrollHeight;
  } catch (err) {
    console.log(err);
  }
}
async function add_msg_to_db(msg, type) {
  try {
    const result = await axios.post(
      `${url}/user/add/msg`,
      { msg: msg, type: type },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    console.log(result.data, "msg from db after adding to backend");
    const msg_append_to_local = result.data;
    const msg_from_local = JSON.parse(localStorage.getItem("msg"));
    let stringified_msg_to_local;
    if (msg_from_local != null) {
      stringified_msg_to_local = JSON.stringify([
        ...msg_from_local,
        msg_append_to_local,
      ]);
    } else {
      stringified_msg_to_local = JSON.stringify([msg_append_to_local]);
    }

    localStorage.setItem("msg", stringified_msg_to_local);
    console.log("updated in local");
  } catch (err) {
    console.log(err);
  }
}

window.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  //establish web sock connection start
  ws.onopen = () => {
    const groupId = "-1"; // Replace with actual group ID
    ws.send(JSON.stringify({ type: "join_group", groupId: groupId }));
  };
  ws.onclose = function () {
    console.log("Disconnected from WebSocket");
  };
  //end establishing connection

  dom_function(event);
});
async function dom_function(event) {
  try {
    let id;
    let final_msg;
    const msg_local = localStorage.getItem("msg");
    //if

    //

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
      if (final_msg.length > 0) {
        localStorage.setItem("msg", JSON.stringify(msgs.data));
      }
    } else {
      console.log("hiiiiiiiiiiiii");
      const parsed_local = JSON.parse(msg_local);
      let fake = false;
      parsed_local.forEach((one_local_msg) => {
        console.log(one_local_msg.msg, "msgggggg");
        if (one_local_msg.msg == "fake_name" && one_local_msg.type == "img") {
          console.log("fake-true", one_local_msg.msg);
          fake = true;
        }
      });
      if (fake == true) {
        id = -1;
        console.log(id, "id sent backend");
        const msgs = await axios.get(`${url}/get/messages/${id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        console.log(msgs.data, "from backend");
        localStorage.removeItem("msg");
        final_msg = msgs.data;
        if (final_msg.length > 0) {
          localStorage.setItem("msg", JSON.stringify(msgs.data));
        }
      }

      console.log(parsed_local, "from local");
      const last_lement = parsed_local[parsed_local.length - 1];
      id = last_lement.id;
      console.log("id sent,,,", id);
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
      console.log(msg.msg, msg.type, msg.user.uname, msg.date);
      add_msg_to_ui(msg.msg, msg.user.uname, msg.type, msg.date);
    });
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
group_btn.addEventListener("click", function (event) {
  event.preventDefault();
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  window.location.href = "../group/group.html";
});
//handle incoming msg
ws.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.type === "new_message") {
    const messageContent = data.content;
    console.log("msg thru socket", messageContent);
    if (messageContent.type == "text") {
      add_msg_to_ui(
        messageContent.msg,
        messageContent.user,
        "text",
        messageContent.date
      );
    } else if (messageContent.type == "img") {
      add_msg_to_ui(
        messageContent.msg,
        messageContent.user,
        "img",
        messageContent.date
      );
    }
  }
};
