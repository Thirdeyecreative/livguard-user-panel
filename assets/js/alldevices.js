const voltageInputValidationMsg = document.getElementById(
  "voltageInputValidationMsg"
);
const voltageGroups = [
  {
    low: document.getElementById("v1_low"),
    high: document.getElementById("v1_high"),
  },
  {
    low: document.getElementById("v2_low"),
    high: document.getElementById("v2_high"),
  },
  {
    low: document.getElementById("v3_low"),
    high: document.getElementById("v3_high"),
  },
  {
    low: document.getElementById("v4_low"),
    high: document.getElementById("v4_high"),
  },
];
const validateVoltageInputs = () => {
  let valid = true;
  let validationMsg = "";

  const numberRegex = /^-?\d+(\.\d+)?$/; // Regex to match positive/negative numbers with decimal

  // Loop through each voltage group
  voltageGroups.forEach((group) => {
    const lowValue = group.low.value.trim();
    const highValue = group.high.value.trim();
    const lowId = group.low.id; // Get the id of the low input
    const highId = group.high.id; // Get the id of the high input

    // Check if low or high value is empty
    if (!lowValue) {
      validationMsg += `${lowId} cannot be empty.\n`;
      valid = false;
      group.low.style.borderColor = "red";
    } else if (!numberRegex.test(lowValue)) {
      validationMsg += `${lowId} must be a valid number.\n`;
      valid = false;
      group.low.style.borderColor = "red";
    } else {
      group.low.style.borderColor = ""; // Clear error styling
    }

    if (!highValue) {
      validationMsg += `${highId} cannot be empty.\n`;
      valid = false;
      group.high.style.borderColor = "red";
    } else if (!numberRegex.test(highValue)) {
      validationMsg += `${highId} must be a valid number.\n`;
      valid = false;
      group.high.style.borderColor = "red";
    } else {
      group.high.style.borderColor = ""; // Clear error styling
    }

    // Check if low value is less than high value
    if (
      numberRegex.test(lowValue) &&
      numberRegex.test(highValue) &&
      parseFloat(lowValue) >= parseFloat(highValue)
    ) {
      validationMsg += `${lowId} should be less than ${highId}.\n`;
      valid = false;
      group.low.style.borderColor = "red";
      group.high.style.borderColor = "red";
    }
  });

  // Display or clear validation message
  if (validationMsg) {
    voltageInputValidationMsg.innerText = validationMsg;
    voltageInputValidationMsg.style.display = "block"; // Show message
  } else {
    voltageInputValidationMsg.style.display = "none"; // Hide message if valid
  }

  return valid;
};
let voltageGroupsErrors = voltageGroups.reverse();
const focusOnVoltageFirstError = () => {
  voltageGroupsErrors.forEach((group, index) => {
    console.log({ group });

    if (group.low.style.borderColor === "red") {
      group.low.focus();
    } else if (group.high.style.borderColor === "red") {
      group.high.focus();
    }
  });
};
const voltageData = {
  // customerId: "",
  v1_low: "",
  v1_high: "",
  v2_low: "",
  v2_high: "",
  v3_low: "",
  v3_high: "",
  v4_low: "",
  v4_high: "",
};
const handleVoltagechange = (event) => {
  voltageData[event.target.name] = event.target.value;
};
function setThreshold(rowData) {
  console.log(rowData);
  // const customerId = rowData.customerId;
  const authToken = localStorage.getItem("authToken");
  const voltageApiUrl = `https://lgdms.livguard.com/voltage-settings/${authToken}`;

  // Clear all fields initially
  voltageGroups.forEach((group) => {
    group.low.value = "";
    group.high.value = "";
  });

  // Make the API call
  fetch(voltageApiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((volData) => {
      // Check if the array is empty
      if (volData.length === 0) {
        return; // Leave the fields as empty
      }

      // Set values for each voltage group
      console.log(volData[0]);

      const voltageSettings = volData[0];
      voltageGroups.forEach((group, index) => {
        document.getElementById(`v${index + 1}_low`).value =
          voltageSettings[`v${index + 1}_low`] || "";
        document.getElementById(`v${index + 1}_high`).value =
          voltageSettings[`v${index + 1}_high`] || "";
      });
      //  set values for voltageData
      voltageData.v1_low = voltageSettings.v1_low;
      voltageData.v1_high = voltageSettings.v1_high;
      voltageData.v2_low = voltageSettings.v2_low;
      voltageData.v2_high = voltageSettings.v2_high;
      voltageData.v3_low = voltageSettings.v3_low;
      voltageData.v3_high = voltageSettings.v3_high;
      voltageData.v4_low = voltageSettings.v4_low;
      voltageData.v4_high = voltageSettings.v4_high;
    })
    .catch((error) => {
      console.error("Error fetching voltage settings:", error);
      // Handle error if necessary, but fields remain empty
    });
}
const handleVoltageSubmit = async (event) => {
  event.preventDefault();

  // Run validation
  if (validateVoltageInputs()) {
    try {
      const authToken = localStorage.getItem("authToken");
      const apiUrl = "https://lgdms.livguard.com/voltage-settings";

      const formData = new FormData();
      formData.append("v1L", voltageData.v1_low);
      formData.append("v1H", voltageData.v1_high);
      formData.append("v2L", voltageData.v2_low);
      formData.append("v2H", voltageData.v2_high);
      formData.append("v3L", voltageData.v3_low);
      formData.append("v3H", voltageData.v3_high);
      formData.append("v4L", voltageData.v4_low);
      formData.append("v4H", voltageData.v4_high);
      formData.append("token", authToken);
      // formData.append("customerId", voltageData.customerId);
      console.log({
        v1L: voltageData.v1_low,
        v1H: voltageData.v1_high,
        v2L: voltageData.v2_low,
        v2H: voltageData.v2_high,
        v3L: voltageData.v3_low,
        v3H: voltageData.v3_high,
        v4L: voltageData.v4_low,
        v4H: voltageData.v4_high,
        token: authToken,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log({ data });
      if (data.errFlag === 0) {
        triggerToast("Threshold updated successfully!", "success");
        closeVoltageModal();
      } else {
        triggerToast("Not authorized", "error");
        closeVoltageModal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    focusOnVoltageFirstError();
    console.log("Validation failed.");
  }
};

const clearVoltageError = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  voltageInputValidationMsg.style.display = "none"; // Hide error message
};
voltageGroups.forEach((group, index) => {
  group.low.addEventListener("input", clearVoltageError);
  group.high.addEventListener("input", clearVoltageError);
});
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
function closeVoltageModal() {
  const modalElement = document.getElementById("ThresholdModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
document.addEventListener("DOMContentLoaded", async function () {
  const authToken = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  const tableBody = document.getElementsByTagName("tbody");
  // console.log(authToken);
  async function fetchData() {
    try {
      const response = await fetch(
        `https://lgdms.livguard.com/alldevices/primary-data/${customerId}/${authToken}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log(data);
      const status = "Online";
      tableBody[0].innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const tableRow = document.createElement("tr");
        //<td>Id : #${customerId}</td>
        tableRow.innerHTML = `
          <td>${row.device_id}</td>
          <td>
            <div class="color_box" style="background-color: ${
              status === "Online" ? "#00B562" : "#626C70"
            };">
              <p>${status}</p>
            </div>
          </td>
          <td>${row.v1}</td>
          <td>${row.v2}</td>
          <td>${row.v3}</td>
          <td>${row.v4}</td>
          <td>${(
            Number(row.v1) +
            Number(row.v2) +
            Number(row.v3) +
            Number(row.v4)
          ).toFixed(2)}</td>
          <td>${row.current}</td>
          <td id="distance${row.device_id}"></td>
          <td>${row.temperature}</td>
          <!--<td><button class="btn btn_local_style">View</button></td>-->
          <td><button class="btn btn_local_style" onclick="openMapModal(${
            row.lat
          }, ${row.long})">View</button>
          <td>${formatDate(row.device_log_date)}<br />${
          row.latest_updated_time
        }</td>
         <!-- <td>
          <button 
            type="button" 
            data-bs-toggle="modal"
            data-bs-target="#ThresholdModal"
            class="btn btn-light" 
            onclick='setThreshold(${JSON.stringify(row)})'
          >
            <i class="bi bi-plus-circle"></i>
          </button>
          </td> -->
          <td>
            <!--<button class="icon_button"><i style="color: #626C70;" class="bi bi-eye-fill"></i></button>-->
            <a href="https://lgdms.livguard.com/download/csv/today/${
              row.device_id
            }/${authToken}" download><button class="icon_button"><i style="color: #626C70;" class="bi bi-download"></i></button></a>
          </td>
        `;
        fetchDistance(row.device_id, authToken);
        tableBody[0].appendChild(tableRow);
      }
      fetchDeviceIds(customerId, authToken);
    } catch (error) {
      console.log(error);
    }
  }
  fetchData();
  setInterval(fetchData, 30000);
});

// auth check
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/";
  }
}
window.onload = checkAuth;
// Add logout event listener
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("authToken");
  localStorage.removeItem("customerId");
  localStorage.clear();
  window.location.href = "/";
});

// map modal
function convertToDecimalDegrees(coordinate) {
  const degrees = Math.floor(coordinate / 100);
  const minutes = coordinate - degrees * 100;
  const decimalDegrees = degrees + minutes / 60;

  return decimalDegrees;
}
function initMap(lat, lng) {
  // console.log(lat, Number(lng));
  const location = {
    lat: convertToDecimalDegrees(Number(lat)),
    lng: convertToDecimalDegrees(Number(lng)),
  };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
  });
  const icon = {
    url: "https://i.postimg.cc/76gy7c3M/auto.png",
    scaledSize: new google.maps.Size(48, 48),
  };

  const marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: icon,
  });
}

function openMapModal(lat, lng) {
  var mapModal = document.getElementById("mapModal");
  var bsModal = new bootstrap.Modal(mapModal);

  // Event listener for when the modal is shown
  mapModal.addEventListener(
    "shown.bs.modal",
    function () {
      initMap(lat, lng);
    },
    { once: true }
  ); // Use { once: true } to ensure the event listener is only triggered once

  bsModal.show();
}
// map modal

// dateformatter
function formatDate(dateString) {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${year}`;
}

function fetchDistance(deviceId, authToken) {
  if (!deviceId) {
    deviceId = "MESH2099";
  }
  // console.log(deviceId, authToken);
  fetch(
    `https://lgdms.livguard.com/distance-travelled/${deviceId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success:", data);
      document.getElementById(`distance${deviceId}`).innerHTML =
        data[0].distance_in_kms.toFixed(2);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function fetchDeviceIds(customerId, authToken) {
  fetch(`https://lgdms.livguard.com/devices/all/${customerId}/${authToken}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success:", data);
      optionsTemplet = ``;
      data.forEach((element) => {
        optionsTemplet += `<option value="${element.device_id}">${element.device_id}</option>`;
      });
      document.getElementById("devices").innerHTML = optionsTemplet;
      //let currentDeviceId = localStorage.getItem("selectedDeviceId");
      //if (!currentDeviceId) {
      //    localStorage.setItem("selectedDeviceId", data[0].device_id);
      //}
      //document.getElementById("devices").value =
      // localStorage.getItem("selectedDeviceId");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
