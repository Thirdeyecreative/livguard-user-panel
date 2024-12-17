document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("email", document.getElementById("inputEmail").value);
    formData.append("password", document.getElementById("inputPassword").value);
    // console.log({
    //   email: document.getElementById("inputEmail").value,
    //   password: document.getElementById("inputPassword").value,
    // });

    fetch("https://lgdms.livguard.com/appusers", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        if (data.errFlag == 0) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("customerId", data.customer_id);
          localStorage.setItem("moduleList", data.modulePermitted);
          window.location.href = "dashboard.html";
        } else {
          // alert(data.message);
          triggerToast(data.message, "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
        triggerToast("Cannot login, Please contact administrator.", "error");
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

function triggerToast(message, type = "error") {
  const toastElement = document.getElementById("toastNotification");
  const toastMessageElement = document.getElementById("toastMessage");

  // Set the message text
  toastMessageElement.textContent = message;

  // Remove any existing background class and add the appropriate one
  toastElement.classList.remove("bg-danger", "bg-success");
  if (type === "success") {
    toastElement.classList.add("bg-success");
  } else {
    toastElement.classList.add("bg-danger");
  }

  // Show the toast
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}
