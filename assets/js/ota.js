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
    if (file.size > 102400) {
      // 100 KB in bytes
      errorMessage += "File size must be less than 100 KB.\n";
    }
  }

  // Display errors or proceed
  if (errorMessage) {
    fileError.textContent = errorMessage.trim();
    fileError.style.display = "block";
    fileSuccessMsg.style.display = "none"; // Hide success message
  } else {
    fileError.style.display = "none"; // Hide error message if validation passes
    const file = fileInput.files[0];

    const formData = new FormData();
    const authToken = localStorage.getItem("authToken");

    // Append the required fields to the FormData
    formData.append("token", authToken);
    formData.append("deviceId", deviceSelect.value);
    formData.append("file", file);

    try {
      // Make the POST request to the backend
      const response = await fetch(
        "https://lgdms.livguard.com/ota/upload-file",
        {
          method: "POST",
          body: formData,
        }
      );
      console.log({response});
      
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "File upload failed");
      }

      // Handle successful response
      fileSuccessMsg.textContent = `File: ${file.name} uploaded successfully for Device ID: ${deviceSelect.value}`;
      fileSuccessMsg.style.display = "block";

      setTimeout(() => {
        fileSuccessMsg.textContent = "";
        fileSuccessMsg.style.display = "none";
      }, 3000);

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
    if (file.type === "text/plain" && file.size <= 102400) {
      updateFileDetails(file); // Update the UI with file details
      clearErrorMsg();
    } else {
      fileError.textContent =
        file.size > 102400
          ? "File size must be less than 100 KB."
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
  event.preventDefault();
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === "text/plain" && file.size <= 102400) {
      updateFileDetails(file); // Update the UI with file details
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files; // Sync file input for form submission
    } else {
      fileError.textContent =
        file.size > 102400
          ? "File size must be less than 100 KB."
          : "Only .txt files are allowed.";
      fileError.style.display = "block";
      console.log("only .txt files are allowed");
    }
  }
}

function triggerFileInput() {
  const fileInput = document.getElementById("file-input");
  fileInput.click(); // Trigger the hidden input when the area is clicked
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.type === "text/plain" && file.size <= 102400) {
      updateFileDetails(file); // Update the UI with file details
    } else {
      fileError.textContent =
        file.size > 102400
          ? "File size must be less than 100 KB."
          : "Only .txt files are allowed.";
      fileError.style.display = "block";
      console.log("only .txt files are allowed");

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
  const fileInput = document.getElementById("file-input");
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
      option.value = device.id;
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
      window.location.href = "login.html";
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
    return null;
  }
}
