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
      // console.log(volData[0]);

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
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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

async function getTempDataForAlert() {
  const authToken = localStorage.getItem("authToken");
  const voltageApiUrl = `https://lgdms.livguard.com/voltage-settings/${authToken}`;

  try {
    const response = await fetch(voltageApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const volData = await response.json();
    console.log(volData);
    if (volData.errFlag == 1) {
      throw new Error(`Error: ${volData.message}`);
    }
    if (volData.length === 0) {
      return null;
    }

    return volData[0];
  } catch (error) {
    console.error("Error fetching voltage settings:", error);
    return null;
  }
}
// function toSetAlert(tempAlerData, params) {
//   const alertDiv = document.createElement("div");
//   if (!tempAlerData) {
//     // If empty, display a gray circle
//     alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
//     return;
//   }
//   const { v1, v2, v3, v4 } = params;
//   const checkAlert = (value, low, high) =>
//     value < parseFloat(low) || value > parseFloat(high);

//   const isAlert = [
//     checkAlert(v1, tempAlerData.v1_low, tempAlerData.v1_high),
//     checkAlert(v2, tempAlerData.v2_low, tempAlerData.v2_high),
//     checkAlert(v3, tempAlerData.v3_low, tempAlerData.v3_high),
//     checkAlert(v4, tempAlerData.v4_low, tempAlerData.v4_high),
//   ].some(Boolean);

//   const allZero = [
//     "v1_high",
//     "v1_low",
//     "v2_high",
//     "v2_low",
//     "v3_high",
//     "v3_low",
//     "v4_high",
//     "v4_low",
//   ].every((key) => parseFloat(tempAlerData[key]) === 0);

//   if (allZero) {
//     alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
//   } else {
//     alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${
//       isAlert ? "red" : "green"
//     }; border-radius: 50%;"></span>`;
//   }

//   return alertDiv;
// }

// function currentStatus(date, time) {
//   const deviceLogDate = date; // e.g., "09/10/2024"
//   const logTime = time; // e.g., "23:38"
//   // console.log(date, time);

//   // Get the current date and time components separately
//   const currentDate = new Date();
//   const currentYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth() + 1; // months are 0-based
//   const currentDay = currentDate.getDate();
//   const currentHours = currentDate.getHours();
//   const currentMinutes = currentDate.getMinutes();

//   // Parse the deviceLogDate and time separately
//   const [logDay, logMonth, logYear] = deviceLogDate.split("/").map(Number); // "MM/DD/YYYY" format
//   const [logHours, logMinutes] = logTime.split(":").map(Number); // "HH:MM" format

//   let statusText = "Online";
//   let backgroundColor = "rgb(213, 255, 213)"; // Green background

//   // Compare the dates
//   if (
//     logYear < currentYear ||
//     (logYear === currentYear && logMonth < currentMonth) ||
//     (logYear === currentYear &&
//       logMonth === currentMonth &&
//       logDay < currentDay)
//   ) {
//     // Device date is in the past
//     statusText = "Offline";
//     backgroundColor = "#EFEFEF";
//   } else if (
//     logYear === currentYear &&
//     logMonth === currentMonth &&
//     logDay === currentDay
//   ) {
//     // If the date is today, compare the times
//     const timeDifference =
//       (currentHours - logHours) * 60 + (currentMinutes - logMinutes); // difference in minutes

//     if (timeDifference >= 5) {
//       statusText = "Offline";
//       backgroundColor = "#EFEFEF";
//     }
//   }

//   return `<span style="color: ${
//     statusText === "Online" ? "#0D5E36" : "gray"
//   };  border: 1px solid ${
//     statusText === "Online" ? "#0D5E36" : "gray"
//   }; padding: 5px; border-radius: 5px; background-color: ${backgroundColor}">${statusText}</span>`;
// }
const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Device ID",
      field: "deviceId",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      headerName: "Status",
      field: "deviceId",
      sortable: true, // Enable sorting
      maxWidth: 100,
      cellRenderer: (params) => {
        const deviceLogDate = params.data.deviceLogDate; // e.g., "09/10/2024"
        const logTime = params.data.time; // e.g., "23:38"

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // months are 0-based
        const currentDay = currentDate.getDate();
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();

        const [logDay, logMonth, logYear] = deviceLogDate
          .split("/")
          .map(Number); // "MM/DD/YYYY" format
        const [logHours, logMinutes] = logTime.split(":").map(Number); // "HH:MM" format

        let statusText = "Online";
        let backgroundColor = "rgb(213, 255, 213)"; // Green background

        if (
          logYear < currentYear ||
          (logYear === currentYear && logMonth < currentMonth) ||
          (logYear === currentYear &&
            logMonth === currentMonth &&
            logDay < currentDay)
        ) {
          statusText = "Offline";
          backgroundColor = "#EFEFEF";
        } else if (
          logYear === currentYear &&
          logMonth === currentMonth &&
          logDay === currentDay
        ) {
          const timeDifference =
            (currentHours - logHours) * 60 + (currentMinutes - logMinutes); // difference in minutes

          if (timeDifference >= 5) {
            statusText = "Offline";
            backgroundColor = "#EFEFEF";
          }
        }

        return `<span style="color: ${
          statusText === "Online" ? "#0D5E36" : "gray"
        };  border: 1px solid ${
          statusText === "Online" ? "#0D5E36" : "gray"
        }; padding: 5px; border-radius: 5px; background-color: ${backgroundColor}">${statusText}</span>`;
      },
      comparator: (valueA, valueB, nodeA, nodeB) => {
        const getStatusRank = (node) => {
          const { deviceLogDate, time } = node.data;

          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const currentDay = currentDate.getDate();
          const currentHours = currentDate.getHours();
          const currentMinutes = currentDate.getMinutes();

          const [logDay, logMonth, logYear] = deviceLogDate
            .split("/")
            .map(Number);
          const [logHours, logMinutes] = time.split(":").map(Number);

          if (
            logYear < currentYear ||
            (logYear === currentYear && logMonth < currentMonth) ||
            (logYear === currentYear &&
              logMonth === currentMonth &&
              logDay < currentDay)
          ) {
            return 0; // Offline (older dates)
          } else if (
            logYear === currentYear &&
            logMonth === currentMonth &&
            logDay === currentDay
          ) {
            const timeDifference =
              (currentHours - logHours) * 60 + (currentMinutes - logMinutes);
            return timeDifference >= 5 ? 0 : 1; // Offline if time difference >= 5 mins
          }

          return 1; // Online
        };

        return getStatusRank(nodeA) - getStatusRank(nodeB);
      },
      filterParams: {
        values: ["Online", "Offline"], // Set the filter options manually
        comparator: (filterValue, cellValue) => {
          // Compare filter values with computed cell values
          return filterValue === cellValue ? 0 : -1;
        },
      },
      filterValueGetter: (params) => {
        const deviceLogDate = params.data.deviceLogDate;
        const logTime = params.data.time;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();

        const [logDay, logMonth, logYear] = deviceLogDate
          .split("/")
          .map(Number);
        const [logHours, logMinutes] = logTime.split(":").map(Number);

        if (
          logYear < currentYear ||
          (logYear === currentYear && logMonth < currentMonth) ||
          (logYear === currentYear &&
            logMonth === currentMonth &&
            logDay < currentDay)
        ) {
          return "Offline";
        } else if (
          logYear === currentYear &&
          logMonth === currentMonth &&
          logDay === currentDay
        ) {
          const timeDifference =
            (currentHours - logHours) * 60 + (currentMinutes - logMinutes);

          if (timeDifference >= 5) {
            return "Offline";
          }
        }

        return "Online";
      },
    },
    {
      headerName: "Alert",
      field: "alert",
      maxWidth: 70,
      filter: false,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        const tempAlerData = params.data.tempAlerData;
        const alertDiv = document.createElement("div");
        if (!tempAlerData) {
          // If empty, display a gray circle
          alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
          return alertDiv;
        }

        const voltageSettings = tempAlerData;
        const { v1, v2, v3, v4 } = params.data;
        const checkAlert = (value, low, high) =>
          value < parseFloat(low) || value > parseFloat(high);

        const isAlert = [
          checkAlert(v1, voltageSettings.v1_low, voltageSettings.v1_high),
          checkAlert(v2, voltageSettings.v2_low, voltageSettings.v2_high),
          checkAlert(v3, voltageSettings.v3_low, voltageSettings.v3_high),
          checkAlert(v4, voltageSettings.v4_low, voltageSettings.v4_high),
        ].some(Boolean);

        const allZero = [
          "v1_high",
          "v1_low",
          "v2_high",
          "v2_low",
          "v3_high",
          "v3_low",
          "v4_high",
          "v4_low",
        ].every((key) => parseFloat(voltageSettings[key]) === 0);

        if (allZero) {
          alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
        } else {
          alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${
            isAlert ? "red" : "green"
          }; border-radius: 50%;"></span>`;
        }

        return alertDiv;
      },
      comparator: (valueA, valueB, nodeA, nodeB) => {
        const getAlertStatus = (node) => {
          const tempAlerData = node.data.tempAlerData;
          if (!tempAlerData) return 0; // Treat as no alert (gray circle)

          const voltageSettings = tempAlerData;
          const { v1, v2, v3, v4 } = node.data;
          const checkAlert = (value, low, high) =>
            value < parseFloat(low) || value > parseFloat(high);

          const isAlert = [
            checkAlert(v1, voltageSettings.v1_low, voltageSettings.v1_high),
            checkAlert(v2, voltageSettings.v2_low, voltageSettings.v2_high),
            checkAlert(v3, voltageSettings.v3_low, voltageSettings.v3_high),
            checkAlert(v4, voltageSettings.v4_low, voltageSettings.v4_high),
          ].some(Boolean);

          const allZero = [
            "v1_high",
            "v1_low",
            "v2_high",
            "v2_low",
            "v3_high",
            "v3_low",
            "v4_high",
            "v4_low",
          ].every((key) => parseFloat(voltageSettings[key]) === 0);

          if (allZero) return 0; // Gray circle
          return isAlert ? 1 : 2; // Red = 1 (high priority), Green = 2 (low priority)
        };

        return getAlertStatus(nodeA) - getAlertStatus(nodeB);
      },
    },
    {
      headerName: "B1",
      field: "v1",
      filter: false,
      sortable: false,
      maxWidth: 80,
    },
    {
      headerName: "B2",
      field: "v2",
      filter: false,
      sortable: false,
      maxWidth: 80,
    },
    {
      headerName: "B3",
      field: "v3",
      filter: false,
      sortable: false,
      maxWidth: 80,
    },
    {
      headerName: "B4",
      field: "v4",
      filter: false,
      sortable: false,
      maxWidth: 80,
    },
    {
      headerName: "Bank Voltage",
      field: "bankVoltage",
      filter: false,
      sortable: false,
      maxWidth: 130,
    },
    {
      headerName: "A",
      field: "current",
      filter: false,
      maxWidth: 80,
    },
    {
      headerName: "Distance",
      field: "deviceId",
      filter: false,
      maxWidth: 130,
      cellRenderer: (params) => {
        const cellDiv = document.createElement("div");
        cellDiv.innerHTML = "Loading...";

        const deviceId = params.value;
        const authToken = localStorage.getItem("authToken");
        const distanceApiUrl = `https://lgdms.livguard.com/distance-travelled/${deviceId}/${authToken}`;

        fetch(distanceApiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            return response.json();
          })
          .then((result) => {
            // console.log({ result });

            // Once we get the data, update the cell content
            cellDiv.innerHTML = `${result[0].distance_in_kms.toFixed(2)} km`;
          })
          .catch((error) => {
            console.error("Error fetching distance:", error);
            cellDiv.innerHTML = "Error";
          });

        return cellDiv;
      },
    },
    {
      headerName: "T",
      field: "temperature",
      filter: false,
      maxWidth: 70,
    },
    {
      headerName: "Inst Speed",
      field: "speed",
      filter: false,
      cellRenderer: (params) => {
        let current = params.data.current;
        let speed = params.data.speed;
        return current > 5 ? 0 : speed;
      },
    },
    {
      headerName: "Date & Time",
      field: "deviceLogDate",
      minWidth: 120,
      cellRenderer: (params) => {
        const date = params.data.deviceLogDate;
        const time = params.data.time;
        // Use <br> for a line break between date and time
        return `${date} <br> ${time}`;
      },
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const date = cellValue.split(" <br> ")[0]; // Extract date part only for comparison
          const dateParts = date.split("/");
          const day = Number(dateParts[0]);
          const month = Number(dateParts[1]) - 1;
          const year = Number(dateParts[2]);
          const cellDate = new Date(year, month, day);

          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          } else {
            return 0;
          }
        },
      },
    },
    {
      headerName: "Location",
      field: "location",
      filter: false,
      sortable: false,
      minWidth: 90,
      cellRenderer: (params) => {
        const lat = params.data.lat;
        const long = params.data.long;
        return `<button 
              type="button"
              class="btn btn_local_style"
              onclick="openMapModal(${lat}, ${long})"
            >View</button>`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      sortable: false,
      maxWidth: 80,
      cellRenderer: (params) => {
        const authToken = localStorage.getItem("authToken");
        const deviceId = params.data.deviceId;
        return `<a 
                  href="https://lgdms.livguard.com/download/csv/today/${deviceId}/${authToken}"
                  download
                >
                  <button 
                    class="btn download-button"
                  >
                    <i style="color: #626C70;" class="bi bi-download"></i>
                  </button>
                </a>`;
      },
    },
  ],

  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    // floatingFilter: true,
    flex: 1,
    filterParams: {
      debounceMs: 0,
      buttons: ["reset"],
    },
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return 80;
  },
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 30, 50],
};
document.addEventListener("DOMContentLoaded", async function () {
  const gridDiv = document.querySelector("#myGrid");
  var gridApi = agGrid.createGrid(gridDiv, gridOptions);
  const tempAlerData = await getTempDataForAlert();
  // console.log({ tempAlerData });

  const authToken = localStorage.getItem("authToken");
  const customerId = localStorage.getItem("customerId");
  // const tableBody = document.getElementsByTagName("tbody");
  fetchDeviceIds(customerId, authToken);
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
      const formattedData = data.map((item, index) => ({
        index: index + 1,
        deviceId: item.device_id,
        deviceLogDate: formatDate(item.device_log_date),
        lat: item.lat,
        long: item.long,
        speed: item.speed,
        temperature: item.temperature,
        v1: item.v1,
        v2: item.v2,
        v3: item.v3,
        v4: item.v4,
        bankVoltage: (
          Number(item.v1) +
          Number(item.v2) +
          Number(item.v3) +
          Number(item.v4)
        ).toFixed(2),
        time: item.latest_updated_time,
        current: item.current,
        tempAlerData: tempAlerData,
      }));
      gridApi.setGridOption("rowData", formattedData);
      console.log(data);
      // tableBody[0].innerHTML = "";
      // for (let i = 0; i < data.length; i++) {
      //   const row = data[i];
      //   const tableRow = document.createElement("tr");
      //   //<td>Id : #${customerId}</td>
      //   tableRow.innerHTML = `
      //     <td>${row.device_id}</td>
      //     <td>
      //       ${currentStatus(
      //         formatDate(row.device_log_date),
      //         row.latest_updated_time
      //       )}
      //     </td>
      //     <td>
      //        ${
      //          toSetAlert(tempAlerData, {
      //            v1: row.v1,
      //            v2: row.v2,
      //            v3: row.v3,
      //            v4: row.v4,
      //          }).outerHTML
      //        }
      //     </td>
      //     <td>${row.v1}</td>
      //     <td>${row.v2}</td>
      //     <td>${row.v3}</td>
      //     <td>${row.v4}</td>
      //     <td>${(
      //       Number(row.v1) +
      //       Number(row.v2) +
      //       Number(row.v3) +
      //       Number(row.v4)
      //     ).toFixed(2)}</td>
      //     <td>${row.current}</td>
      //     <td id="distance${row.device_id}"></td>
      //     <td>${row.temperature}</td>
      //     <td>${row.current > 5 ? 0 : row.speed}</td>
      //     <td>${formatDate(row.device_log_date)}<br />${
      //     row.latest_updated_time
      //   }</td>
      //     <!--<td><button class="btn btn_local_style">View</button></td>-->
      //     <td><button class="btn btn_local_style" onclick="openMapModal(${
      //       row.lat
      //     }, ${row.long})">View</button>
      //     <td>
      //       <!--<button class="icon_button"><i style="color: #626C70;" class="bi bi-eye-fill"></i></button>-->
      //       <a href="https://lgdms.livguard.com/download/csv/today/${
      //         row.device_id
      //       }/${authToken}" download><button class="btn download-button"><i style="color: #626C70;" class="bi bi-download"></i></button></a>
      //     </td>
      //   `;
      //   fetchDistance(row.device_id, authToken);
      //   tableBody[0].appendChild(tableRow);
      // }
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

// function fetchDistance(deviceId, authToken) {
//   if (!deviceId) {
//     deviceId = "MESH2099";
//   }
//   // console.log(deviceId, authToken);
//   fetch(
//     `https://lgdms.livguard.com/distance-travelled/${deviceId}/${authToken}`,
//     {
//       method: "GET",
//     }
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       // console.log("Success:", data);
//       document.getElementById(`distance${deviceId}`).innerHTML =
//         data[0].distance_in_kms.toFixed(2);
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }

function fetchDeviceIds(customerId, authToken) {
  fetch(`https://lgdms.livguard.com/devices/all/${customerId}/${authToken}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success:", data);
      optionsTemplet = ``;
      data = data.sort((a, b) => {
        if (a.device_id < b.device_id) return -1;
        if (a.device_id > b.device_id) return 1;
        return 0;
      });
      // console.log("sortedData", data);

      data.forEach((element) => {
        optionsTemplet += `<option value="${element.device_id}">${element.device_id}</option>`;
      });
      document.getElementById("devices").innerHTML = optionsTemplet;
      let currentDeviceId = localStorage.getItem("allDevicesSelectedDeviceId");
      if (!currentDeviceId) {
        localStorage.setItem("allDevicesSelectedDeviceId", data[0].device_id);
      }
      document.getElementById("devices").value = localStorage.getItem(
        "allDevicesSelectedDeviceId"
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("devices").addEventListener("change", function () {
    localStorage.setItem("allDevicesSelectedDeviceId", this.value);
  });
});
