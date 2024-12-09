const addUserBtn = document.getElementById("addUserBtn");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const modulesCheckbox = document.getElementById("modulesCheckbox");
const inputValidationMsg = document.getElementById("inputValidationMsg");
let isEditing = false;
const spinnerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Please wait...`;
let gridApi;
const usernameRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[A-Za-z\s-]+$/;
const emailRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*[<>\\/\[\]{};:]).{6,}$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate username
  if (!usernameInput.value.trim()) {
    validationMsg += "Username cannot be empty.\n";
    valid = false;
    usernameInput.style.borderColor = "red";
  } else if (!usernameInput.value.trim().match(usernameRegex)) {
    validationMsg +=
      "Username should only contain letters, spaces, or hyphens.\n";
    valid = false;
    usernameInput.style.borderColor = "red";
  } else {
    usernameInput.style.borderColor = ""; // Clear error styling
  }

  // Validate email
  if (!emailInput.value.trim()) {
    validationMsg += "Email cannot be empty.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else if (!emailInput.value.trim().match(emailRegex)) {
    validationMsg += "Please enter a valid email address.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else {
    emailInput.style.borderColor = ""; // Clear error styling
  }

  // Validate password (can be empty for editing, otherwise must follow the rules)
  if (passwordInput.value && !passwordInput.value.trim().match(passwordRegex)) {
    validationMsg +=
      "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one number, and one symbol.\n";
    valid = false;
    passwordInput.style.borderColor = "red";
  } else {
    passwordInput.style.borderColor = ""; // Clear error styling
  }
  if (!isEditing) {
    if (!passwordInput.value.trim()) {
      validationMsg += "Password cannot be empty.\n";
      valid = false;
      passwordInput.style.borderColor = "red";
    }
  }

  // Display or clear validation message
  if (validationMsg) {
    inputValidationMsg.innerText = validationMsg;
    inputValidationMsg.style.display = "block"; // Show message
  } else {
    inputValidationMsg.style.display = "none"; // Hide message if valid
  }

  return valid;
};

// Focus on the first invalid field
const focusOnFirstError = () => {
  if (usernameInput.style.borderColor === "red") {
    usernameInput.focus();
  } else if (emailInput.style.borderColor === "red") {
    emailInput.focus();
  } else if (passwordInput.style.borderColor === "red") {
    passwordInput.focus();
  }
};
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  inputValidationMsg.style.display = "none"; // Hide error message
};

modulesCheckbox.addEventListener("click", clearErrorMessages);
usernameInput.addEventListener("input", clearErrorMessages);
emailInput.addEventListener("input", clearErrorMessages);
passwordInput.addEventListener("input", clearErrorMessages);
class StatusCellRenderer {
  init(params) {
    this.eGui = document.createElement("div");
    const isChecked = params.value === 1 ? "checked" : "";

    this.eGui.innerHTML = `
      <label class="switch">
        <input id=${params.data.id} type="checkbox" class="checkbox" ${isChecked}>
        <div class="slider"></div>
      </label>`;

    const checkbox = this.eGui.querySelector('input[type="checkbox"]');

    checkbox.addEventListener("change", async () => {
      const newStatus = checkbox.checked ? 1 : 0;
      const success = await toggleStatus(params.data.id, newStatus);
      if (success) {
        params.setValue(newStatus);
      } else {
        checkbox.checked = !checkbox.checked;
      }
    });
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    const checkbox = this.eGui.querySelector('input[type="checkbox"]');
    checkbox.checked = params.value === 1;
    return true;
  }
}

const userData = {
  appUserId: "",
  username: "",
  email: "",
  password: "",
};
const onBtnAdd = () => {
  isEditing = false;
  addUserBtn.innerText = "Add";
  userData.username = "";
  userData.email = "";
  userData.password = "";

  usernameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";

  // Uncheck all checkboxes inside the modal
  const checkboxes = document.querySelectorAll(
    "#userModal input[type='checkbox']"
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
};
function handleEdit(rowData) {
  isEditing = true;
  addUserBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData);
  userData.appUserId = rowData.id;
  userData.username = rowData.userName;
  userData.email = rowData.email;
  usernameInput.value = rowData.userName;
  emailInput.value = rowData.email;
  passwordInput.value = "";

  // Uncheck all checkboxes inside the modal first
  const checkboxes = document.querySelectorAll(
    "#userModal input[type='checkbox']"
  );
  console.log(rowData);

  // Check checkboxes that match the module_permitted in rowData
  checkboxes.forEach((checkbox) => {
    const isPermitted = rowData.module_permitted.some(
      (item) => item == checkbox.value
    );
    checkbox.checked = isPermitted;
  });
}
const handleUserSubmit = async (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }
  const checkedInputs = document.querySelectorAll(
    "#userModal input[type='checkbox']:checked"
  );
  const array = Array.from(checkedInputs).map((input) => input.value);
  const selectedValues = JSON.stringify(
    Array.from(checkedInputs).map((input) => Number(input.value))
  );

  if (array.length === 0) {
    inputValidationMsg.textContent = "Please select at least one module.";
    inputValidationMsg.style.display = "block";
    focusOnFirstError();
    return;
  }
  console.log({
    token: authToken,
    username: usernameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    moduleList: selectedValues,
  });

  try {
    addUserBtn.disabled = true;
    addUserBtn.innerHTML = spinnerHTML;
    const apiUrl = !isEditing
      ? "https://lgdms.livguard.com/appusers/add"
      : "https://lgdms.livguard.com/appusers/update";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("moduleList", selectedValues);

    if (isEditing) {
      formData.append("appUserId", userData.appUserId);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("data", data);

    if (data.errFlag === 0) {
      fetchUsers(gridApi);
      closeModal();
    } else {
      console.error("Server returned an error:", data);
      inputValidationMsg.style.display = "block";
      inputValidationMsg.innerText = data.message || "Failed to add user";
      setTimeout(() => {
        inputValidationMsg.style.display = "none";
      }, 2000);
    }
  } catch (error) {
    console.error("Error occurred during submission:", error);
  } finally {
    addUserBtn.disabled = false;
    addUserBtn.innerHTML = "Add";
  }
};

function closeModal() {
  const modalElement = document.getElementById("userModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
const handlechange = (event) => {
  userData[event.target.name] = event.target.value;
};
async function fetchUsers(gridApi) {
  const modulesData = await fetchModulesData();
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://lgdms.livguard.com/appusers/all/${authToken}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);

    data.errFlag === 1
      ? (window.location.href = "/")
      : console.log("Super admin data:", data);

    const formattedData = data.map((item, index) => ({
      index: index + 1,
      userName: item.username,
      status: item.status,
      email: item.email,
      id: item.id,
      module_permitted: JSON.parse(item.module_list),
      module_name: modulesData.map((module)=>{
         isAvalilable = JSON.parse(item.module_list).some(
          (moduleId) => moduleId == module.id
        );
        if(isAvalilable){
          return module.module
        }
      }),
      lock_user: item.lock_user,
    }));
    console.log({ formattedData });

    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "/";
  }
}

async function toggleStatus(userId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://lgdms.livguard.com/appusers/update/status/${authToken}/${userId}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Status updated successfully for customer ${userId}:`, result);
    if (result.errFlag === 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating customer status:", error);
    triggerErrorToast("Please check your internet connection and try again.");
    return false;
  }
}
function triggerErrorToast(message) {
  const toastElement = document.getElementById("errorToast");
  const toastMessageElement = document.getElementById("toastMessage");
  toastMessageElement.textContent = message;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No",
      field: "index",
      maxWidth: 100,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "User Name",
      field: "userName",
    },
    {
      headerName: "Email",
      field: "email",
    },
    {
      headerName: "Modules Permitted",
      field: "module_name",
      valueFormatter: function (params) {
        return params.value.join(", ");
      },
      cellRenderer: function (params) {
        return `<div>
              <ol>
                ${params.value.map((item) => `<li>${item}</li>`).join("")}
              </ol>
            </div>`;
      },
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: "Action",
      field: "id",
      filter: false,
      sortable: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: function (params) {
        return `<button 
                  type="button" 
                  style="margin-top:10px;" 
                  data-bs-toggle="modal"
                  data-bs-target="#userModal"
                  class="btn btn-light" 
                  onclick='handleEdit(${JSON.stringify(params.data)})'
                >
                  <i class="bi bi-pencil-square"></i>
                </button>`;
      },
    },
  ],

  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    flex: 1,
    filterParams: {
      debounceMs: 0,
      buttons: ["reset"],
    },
    cellClassRules: {
      "disabled-cell": (params) => params.data.lock_user === 1,
    },
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return params.data.module_permitted.length > 1
      ? params.data.module_permitted.length * 45
      : 80;
  },
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 30],
  // enableCellTextSelection: true,
};

document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  fetchUsers(gridApi);
});

document.addEventListener("DOMContentLoaded", async function () {
  const modulesData = await fetchModulesData();

  if (modulesData) {
    console.log("Modusles data:", modulesData);
    modulesData.forEach((customer) => {
      // console.log({ customer });
      const inputElement = document.createElement("input");
      inputElement.type = "checkbox";
      inputElement.value = customer.id;
      inputElement.id = customer.id;
      inputElement.name = customer.file_name;
      inputElement.classList.add("form-check-input");
      const labelElement = document.createElement("label");
      labelElement.htmlFor = customer.id;
      labelElement.textContent = customer.module;
      labelElement.classList.add("form-check-label");
      labelElement.style.margin = "3px 0px 0px 4px";
      const divElement = document.createElement("div");
      divElement.classList.add("form-check");
      divElement.appendChild(inputElement);
      divElement.appendChild(labelElement);
      modulesCheckbox.appendChild(divElement);
    });
  }
});
async function fetchModulesData() {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://lgdms.livguard.com/appusers-modules/${authToken}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errFlag === 1) {
      window.location.href = "/";
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "/";
    return null;
  }
}
