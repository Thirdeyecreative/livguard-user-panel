document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("email", document.getElementById("inputEmail").value);
    formData.append("password", document.getElementById("inputPassword").value);
    console.log({ formData });

    fetch("https://dms.meshaenergy.com/apis/appusers", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        if (data.errFlag == 0) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("customerId", data.customer_id);
          window.location.href = "dashboard.html";
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// togglePassword
const inputTag = document.getElementById("inputPassword");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", function () {
  if (inputTag.type === "password") {
    // text
    inputTag.type = "text";
  } else {
    inputTag.type = "password";
  }
});

// togglePassword