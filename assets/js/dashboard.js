function currentStatus(date, time) {
  const deviceLogDate = date; // e.g., "09/10/2024"
  const logTime = time; // e.g., "23:38"
  // console.log(date, time);

  // Get the current date and time components separately
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // months are 0-based
  const currentDay = currentDate.getDate();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  // Parse the deviceLogDate and time separately
  const [logDay, logMonth, logYear] = deviceLogDate.split("/").map(Number); // "MM/DD/YYYY" format
  const [logHours, logMinutes] = logTime.split(":").map(Number); // "HH:MM" format

  let statusText = "Online";
  let backgroundColor = "rgb(213, 255, 213)"; // Green background

  // Compare the dates
  if (
    logYear < currentYear ||
    (logYear === currentYear && logMonth < currentMonth) ||
    (logYear === currentYear &&
      logMonth === currentMonth &&
      logDay < currentDay)
  ) {
    // Device date is in the past
    statusText = "Offline";
    backgroundColor = "#EFEFEF";
  } else if (
    logYear === currentYear &&
    logMonth === currentMonth &&
    logDay === currentDay
  ) {
    // If the date is today, compare the times
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
  }; padding: 0 5px; border-radius: 5px; background-color: ${backgroundColor}">${statusText}</span>`;
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

function toSetAlert(tempAlerData, params) {
  const alertDiv = document.createElement("div");
  if (!tempAlerData) {
    // If empty, display a gray circle
    alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
    return;
  }
  const { v1, v2, v3, v4 } = params;
  const checkAlert = (value, low, high) =>
    value < parseFloat(low) || value > parseFloat(high);

  const isAlert = [
    checkAlert(v1, tempAlerData.v1_low, tempAlerData.v1_high),
    checkAlert(v2, tempAlerData.v2_low, tempAlerData.v2_high),
    checkAlert(v3, tempAlerData.v3_low, tempAlerData.v3_high),
    checkAlert(v4, tempAlerData.v4_low, tempAlerData.v4_high),
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
  ].every((key) => parseFloat(tempAlerData[key]) === 0);

  if (allZero) {
    alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
  } else {
    alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${
      isAlert ? "red" : "green"
    }; border-radius: 50%;"></span>`;
  }

  return alertDiv;
}

document.addEventListener("DOMContentLoaded", async () => {
  const tempAlerData = await getTempDataForAlert();
  const authToken = localStorage.getItem("authToken");
  const savedDeviceId = localStorage.getItem("selectedDeviceId") || "0001";
  const customers = ["Livguard", "Mesha", "Race", "Korakso"];
  const selectDevice = document.getElementById("devices");

  // Utility function to fetch data
  async function fetchData(deviceId) {
    try {
      const response = await fetch(
        `https://lgdms.livguard.com/dashboard/primary-data/${deviceId}/${authToken}`,
        { method: "GET" }
      );
      let data = await response.json();
      console.log({data});
      
      data = data[0] || {
        latest_updated_time: "00:00",
        device_log_date: new Date(),
        v1: "0",
        v2: "0",
        v3: "0",
        v4: "0",
        current: "0",
        temperature: "0",
        speed: "0",
      };

      updateDashboard(data);
      fetchDistance(deviceId, authToken);
      fetchDeviceIds(authToken);
      initMap(data.lat, data.long);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Update dashboard elements
  function updateDashboard(data) {
    document.getElementById("statusDiv").innerHTML = `${currentStatus(
      formatDate(data.device_log_date),
      data.latest_updated_time
    )} ${
      toSetAlert(tempAlerData, {
        v1: data.v1,
        v2: data.v2,
        v3: data.v3,
        v4: data.v4,
      }).outerHTML
    }`;

    document.getElementById("timeAndDate").textContent = `${
      data.latest_updated_time
    } ; ${formatDate(data.device_log_date)}`;
    document.getElementById("v1").textContent = data.v1;
    document.getElementById("v2").textContent = data.v2;
    document.getElementById("v3").textContent = data.v3;
    document.getElementById("v4").textContent = data.v4;

    document.getElementById("totalVoltage").textContent = (
      Number(data.v1) +
      Number(data.v2) +
      Number(data.v3) +
      Number(data.v4)
    ).toFixed(2);

    document.getElementById("current").textContent = data.current;
    document.getElementById("temperature").textContent = data.temperature;
    document.getElementById("speed").textContent = data.speed;

    const customerId = localStorage.getItem("customerId");
    document.getElementById("vendorName").textContent =
      customers[parseInt(customerId) - 1] || "Unknown Vendor";
  }

  // Handle device selection changes
  function handleDeviceChange(event) {
    const deviceId = event.target.value;
    localStorage.setItem("selectedDeviceId", deviceId);
    fetchData(deviceId);
  }

  // Initialize
  function initialize() {
    if (savedDeviceId) {
      selectDevice.value = savedDeviceId;
    }

    selectDevice.addEventListener("change", handleDeviceChange);

    // Periodic updates
    setInterval(() => {
      const currentDeviceId = localStorage.getItem("selectedDeviceId");
      if (currentDeviceId) {
        fetchData(currentDeviceId);
      }
    }, 30000);

    fetchData(savedDeviceId);
  }

  initialize();
});

// AIzaSyDP1O86frM0Al9QspBpJqN06wTB2AM5yZQ

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
  localStorage.clear();
  window.location.href = "/";
});

function convertToDecimalDegrees(coordinate) {
  // Extract degrees and minutes
  const degrees = Math.floor(coordinate / 100);
  const minutes = coordinate - degrees * 100;

  // Convert to decimal degrees
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

function fetchDeviceIds(authToken) {
  customerId = localStorage.getItem("customerId");
  fetch(`https://lgdms.livguard.com/devices/all/${customerId}/${authToken}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success:", data);
      data = data.sort((a, b) => {
        if (a.device_id < b.device_id) return -1;
        if (a.device_id > b.device_id) return 1;
        return 0;
      });
      optionsTemplet = ``;
      data.forEach((element) => {
        optionsTemplet += `<option value="${element.device_id}">${element.device_id}</option>`;
      });
      document.getElementById("devices").innerHTML = optionsTemplet;

      let currentDeviceId = localStorage.getItem("selectedDeviceId");
      if (!currentDeviceId) {
        localStorage.setItem("selectedDeviceId", data[0].device_id);
      }
      document.getElementById("devices").value =
        localStorage.getItem("selectedDeviceId");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function fetchDistance(deviceId, authToken) {
  /*if (!deviceId) {
    deviceId = "MESH2099";
  }*/
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
      document.getElementById("distance").innerHTML =
        data[0].distance_in_kms.toFixed(2);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  chargeDischargeDisplay(
    localStorage.getItem("selectedDeviceId"),
    localStorage.getItem("authToken")
  );
}

chargeDischargeDisplay(
  localStorage.getItem("selectedDeviceId"),
  localStorage.getItem("authToken")
);
function convertTime(hours) {
  const totalMinutes = hours * 60;
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = Math.round(totalMinutes % 60);

  return `${hoursPart}h, ${minutesPart}min`;
}
function chargeDischargeDisplay(deviceId, authToken) {
  var tableBody = document.getElementById("data-table-body");
  tableBody.innerHTML = "";

  fetch(
    `https://lgdms.livguard.com/dashboard/charge_discharge/csv/date-range/${deviceId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success: ++++++++++++++++++ ", data);

      // Loop through the data and create table rows
      data.forEach((item) => {
        const row = `
                    <tr>
                        <td>${item["Cycle Type"]}</td>
                        <td>${item["Date Time - From"]}</td>
                        <td>${item["Date Time - To"]}</td>
                        <td>${item["Distance Travelled"]}</td>
                        <td>${convertTime(item["Duration - Hours"])}</td>
                        <td>${item["Temperature - Max"]}</td>
                        <td>${item["Temperature - Min"]}</td>
                        <td>${
                          item["Cycle Type"] == "Charging" ? item["ah"] : ""
                        }</td>
                        <td>${
                          item["Cycle Type"] == "Discharging" ? item["ah"] : ""
                        }</td>
                        <td>${item["b1"]}</td>
                        <td>${item["b2"]}</td>
                        <td>${item["b3"]}</td>
                        <td>${item["b4"]}</td>
                        <td>${item["Amps - Max"]}</td>
                        <td>${item["Amps - Min"]}</td>
                        <td>${item["Bank Voltage"]}</td>
                    </tr>
                `;
        tableBody.innerHTML += row; // Append the row to the table
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
