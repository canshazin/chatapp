console.log("start of signup script");
const url = "http://13.201.78.180:3000";
const signup = document.querySelector("#signup");
const user_name = document.querySelector("#user_name");
const user_email = document.querySelector("#user_email");
const user_password = document.querySelector("#user_password");
const user_mobile = document.querySelector("#mobile");
const warning = document.querySelector("#warning");
signup.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();

    const user = {
      uname: user_name.value,
      email: user_email.value,
      password: user_password.value,
      mobile: user_mobile.value,
    };
    const result = await axios.post(`${url}/user/signup`, user);
    console.log(result.data);
    signup.reset();
    alert(result.data.msg);
  } catch (err) {
    console.log(err);
  }
});
