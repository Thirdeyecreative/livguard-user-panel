const authToken = localStorage.getItem("authToken");
const customerId = localStorage.getItem("customerId");
let voltageThreshold;
document.addEventListener("DOMContentLoaded", async function () {
  const deviceId = document.getElementById("deviceId");
  const deviceData = await fetchDeviceData();
  await setThreshold();
  //   console.log(deviceData);

  if (deviceData) {
    // console.log("User Role data:", deviceData);
    // const option = document.createElement("option");
    // option.value = "";
    // option.textContent = "Select Device ID";
    // deviceId.appendChild(option);
    deviceData.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.device_id;
      option.textContent = device.device_id;
      deviceId.appendChild(option);
    });

    deviceId.addEventListener("change", async function () {
      const selectedDeviceId = this.value;
      console.log({ selectedDeviceId });
    });
  }
});

async function fetchDeviceData() {
  const apiUrl = `https://lgdms.livguard.com/devices/all/${customerId}/${authToken}`;

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
    data.sort((a, b) => a.device_id.localeCompare(b.device_id));

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "/";
    return null;
  }
}
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
async function handleFormSubmit(event) {
  event.preventDefault();
  //  console.log(voltageThreshold);
  const deviceId = document.getElementById("deviceId");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");

  // Reset field highlights
  deviceId.style.border = "";
  fromDate.style.border = "";
  toDate.style.border = "";

  // Validation: Check if any field is empty
  if (
    !deviceId.value.trim() ||
    !fromDate.value.trim() ||
    !toDate.value.trim()
  ) {
    // Highlight missing fields
    if (!deviceId.value.trim()) deviceId.style.border = "2px solid red";
    if (!fromDate.value.trim()) fromDate.style.border = "2px solid red";
    if (!toDate.value.trim()) toDate.style.border = "2px solid red";

    // Display error message
    triggerToast("Please fill all the required fields.", "error");
    return;
  }

  // Validation: Check if From Date is greater than To Date
  if (new Date(fromDate.value) > new Date(toDate.value)) {
    triggerToast("From Date should not be greater than To Date.", "error");
    fromDate.style.border = "2px solid red";
    toDate.style.border = "2px solid red";
    return;
  }

  const apiUrl = `https://lgdms.livguard.com/alert-mgr/date-range/${deviceId.value}/${fromDate.value}/${toDate.value}/${authToken}`;

  // Display the selected values
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
      return;
    }

    console.log({ data });
    const filterdData = data.filter((item) => {
      const { b1: v1, b2: v2, b3: v3, b4: v4 } = item;
      const checkAlert = (value, low, high) =>
        value < parseFloat(low) || value > parseFloat(high);

      const isAlert = [
        checkAlert(v1, voltageThreshold.v1_low, voltageThreshold.v1_high),
        checkAlert(v2, voltageThreshold.v2_low, voltageThreshold.v2_high),
        checkAlert(v3, voltageThreshold.v3_low, voltageThreshold.v3_high),
        checkAlert(v4, voltageThreshold.v4_low, voltageThreshold.v4_high),
      ].some(Boolean);

      return isAlert;
    });

    const formattedData = filterdData.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
}

async function setThreshold() {
  const authToken = localStorage.getItem("authToken");
  const voltageApiUrl = `https://lgdms.livguard.com/voltage-settings/${authToken}`;

  try {
    const response = await fetch(voltageApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const volData = await response.json();

    if (volData.errFlag === 1) {
      window.location.href = "/";
      return; // Prevent further execution if redirected
    }

    voltageThreshold = volData[0];
    for (let i = 0; i < 4; i++) {
      document.getElementById(`v${i + 1}Low`).textContent =
        voltageThreshold[`v${i + 1}_low`];
      document.getElementById(`v${i + 1}High`).textContent =
        voltageThreshold[`v${i + 1}_high`];
    }
    console.log({ volData, voltageThreshold });
  } catch (error) {
    console.error("Error fetching voltage settings:", error);
    // Handle the error as needed (e.g., display an error message to the user)
  }
}

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No",
      field: "index",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Device ID",
      field: "device_id",
      minWidth: 180,
    },
    {
      headerName: "V1",
      field: "b1",
    },
    {
      headerName: "V2",
      field: "b2",
    },
    {
      headerName: "V3",
      field: "b3",
    },
    {
      headerName: "V4",
      field: "b4",
    },
  ],
  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    flex: 1,
    filterParams: {
      debounceMs: 0,
      // buttons: ["reset"],
    },
    cellClassRules: {
      "disabled-cell": (params) =>
        params.data.email === localStorage.getItem("userEmail") ||
        params.data.id === 1,
    },
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return 80;
  },
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 30],
  // enableCellTextSelection: true,
};

document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);
});

// ag-grid code end
