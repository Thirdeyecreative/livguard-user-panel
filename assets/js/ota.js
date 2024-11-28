var gridApi;
const authToken = localStorage.getItem("authToken");
const customerId = localStorage.getItem("customerId");
const fileInput = document.getElementById("file-input");
const deviceSelect = document.getElementById("device-select");
const fileError = document.getElementById("fileError");
const fileSuccessMsg = document.getElementById("fileSuccessMsg");

async function handleFileUpload(event) {
  event.preventDefault();

  let errorMessage = "";

  // Validate select field
  if (!deviceSelect.value) {
    errorMessage += "Please select a device ID.\n";
  }

  // Validate file input
  if (fileInput.files.length === 0) {
    errorMessage += "Please select a file.\n";
  } else {
    const file = fileInput.files[0];

    if (file.type !== "text/plain") {
      errorMessage += "Only .txt files are allowed.\n";
    }
    if (file.size > 307200) {
      // 300 KB in bytes
      errorMessage += "File size must be less than 300 KB.\n";
    }
  }

  if (errorMessage) {
    fileError.textContent = errorMessage.trim();
    fileError.style.display = "block";
    fileSuccessMsg.style.display = "none";
  } else {
    fileError.style.display = "none";
    const file = fileInput.files[0];

    const formData = new FormData();
    const authToken = localStorage.getItem("authToken");

    formData.append("token", authToken);
    formData.append("deviceId", deviceSelect.value);
    formData.append("file", file);
    console.log({
      token: authToken,
      deviceId: deviceSelect.value,
      file: file,
    });

    try {
      // Make the POST request to the backend
      const response = await fetch(
        "https://lgdms.livguard.com/ota/upload-file",
        {
          method: "POST",
          body: formData,
        }
      );
      console.log({ response });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "File upload failed");
      }

      // Handle successful response
      fileSuccessMsg.textContent = `File: ${file.name} uploaded successfully for Device ID: ${deviceSelect.value}`;
      fileSuccessMsg.style.display = "block";
      deviceSelect.value = "";
      resetFile();
      fetchOtaFilesData(gridApi);
      setTimeout(() => {
        fileSuccessMsg.textContent = "";
        fileSuccessMsg.style.display = "none";
      }, 5000);

      console.log("File uploaded successfully:", await response.json());
    } catch (error) {
      // Handle errors from the API
      fileError.textContent = `Upload failed: ${error.message}`;
      fileError.style.display = "block";
      fileSuccessMsg.style.display = "none"; // Hide success message
      console.error("Error uploading file:", error);
    }
  }
}

function clearErrorMsg() {
  fileError.textContent = "";
  fileError.style.display = "none";
}

deviceSelect.addEventListener("change", clearErrorMsg);
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.type === "text/plain" && file.size <= 307200) {
      updateFileDetails(file); // Update the UI with file details
      clearErrorMsg();
    } else {
      fileError.textContent =
        file.size > 307200
          ? "File size must be less than 300 KB."
          : "Only .txt files are allowed.";
      fileError.style.display = "block";
      console.log("only .txt files are allowed");

      resetFile();
    }
  }
});

function handleDragOver(event) {
  event.preventDefault();
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.add("drag-over");
}

function handleDragLeave(event) {
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("drag-over");
}

function handleDrop(event) {
  fileError.textContent = "";
  event.preventDefault();
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === "text/plain" && file.size <= 307200) {
      updateFileDetails(file); // Update the UI with file details
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files; // Sync file input for form submission
    } else {
      fileError.textContent =
        file.size > 307200
          ? "File size must be less than 300 KB."
          : "Only .txt files are allowed.";
      fileError.style.display = "block";
    }
  }
}

function triggerFileInput() {
  fileInput.click(); // Trigger the hidden input when the area is clicked
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.type === "text/plain" && file.size <= 307200) {
      updateFileDetails(file); // Update the UI with file details
    } else {
      fileError.textContent =
        file.size > 307200
          ? "File size must be less than 300 KB."
          : "Only .txt files are allowed.";
      fileError.style.display = "block";

      resetFile();
    }
  }
}

function updateFileDetails(file) {
  const fileInfo = document.getElementById("file-info");
  const dropArea = document.getElementById("drop-area");

  fileInfo.classList.remove("d-none");
  dropArea.classList.add("d-none");
  document.getElementById("file-name").textContent = file.name;
  document.getElementById("file-size").textContent = formatFileSize(file.size);
}

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}

function resetFile() {
  fileInput.value = ""; // Clear the file input
  document.getElementById("file-info").classList.add("d-none");
  document.getElementById("drop-area").classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", async function () {
  const deviceId = document.getElementById("device-select");
  const deviceData = await fetchDeviceData();
  console.log(deviceData);

  if (deviceData) {
    console.log("User Role data:", deviceData);
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select Device ID";
    deviceId.appendChild(option);
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

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "/";
    return null;
  }
}

// ag-grid code start
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
async function fetchOtaFilesData(gridApi) {
  const authToken = localStorage.getItem("authToken");
  console.log({ authToken });

  const apiUrl = `https://lgdms.livguard.com/ota-files/all/${authToken}`;

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
    console.log({ data });

    data.errFlag === 1
      ? (window.location.href = "/")
      : console.log("Super admin data:", data);

    const formattedData = data.map((item, index) => ({
      index: index + 1,
      fileName: item.file_name,
      createdDate: formatDate(item.created_date),
      createdTime: item.created_time,
      status: item.status,
      id: item.id,
      deviceId: item.device_master_id,
      deviceIdName: item.device_id,
    }));
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "/";
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
      field: "deviceIdName",
      minWidth: 180,
    },
    {
      headerName: "File Name",
      field: "fileName",
    },
    {
      headerName: "Created Date",
      field: "createdDate",
      filter: "agDateColumnFilter",
      maxWidth: 300,
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const dateParts = cellValue.split("-");
          const year = Number(dateParts[2]);
          const month = Number(dateParts[1]) - 1;
          const day = Number(dateParts[0]);
          const cellDate = new Date(year, month, day);
          // Compare dates
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
      headerName: "Created Tiem",
      field: "createdTime",
      filter: false,
      sortable: false,
      maxWidth: 200,
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params) => {
        const isActive = params.value === 1;
        const styles = isActive
          ? "border: 1px solid green; background-color: rgba(0, 255, 0, 0.07); color: green; padding: 5px; border-radius: 4px; text-align: center;"
          : "border: 1px solid red; background-color: rgba(255, 0, 0, 0.07); color: red; padding: 5px; border-radius: 4px; text-align: center;";
        const statusText = isActive ? "Active" : "Inactive";
        return `<span style="${styles}">${statusText}</span>`;
      },
    },
    // {
    //   headerName: "Upload",
    //   field: "status",
    //   filter: false,
    //   cellRenderer: (params) => {
    //     if (params.value == 1) {
    //       return `
    //       <button class="btn btn-outline-primary btn-sm mt-2" type="button" disabled>
    //         <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    //         <span role="status">Uploading...</span>
    //       </button>
    //       `;
    //     } else {
    //       return `
    //       <div
    //         class="mt-2"
    //         style="
    //         border: 1px solid green; 
    //         width: 30px; 
    //         height: 30px; 
    //         display: flex; 
    //         justify-content: center; 
    //         align-items: center; 
    //         border-radius: 50%;
    //         color: green;
    //         "
    //       >
    //         <i class="bi bi-check2" style="font-size: 20px; font-weight: 900;"></i>
    //       </div>
    //       `;
    //     }
    //   },
    // },
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

  fetchOtaFilesData(gridApi);
});

// ag-grid code end
