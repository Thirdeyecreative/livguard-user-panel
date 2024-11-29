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

document.addEventListener("DOMContentLoaded", async function () {
  const tempAlerData = await getTempDataForAlert();
  console.log({ tempAlerData });

  const dashboardContainer = document.getElementById("dashboardContainer");
  const authToken = localStorage.getItem("authToken");
  const savedDeviceId = localStorage.getItem("selectedDeviceId") || "0001";
  function fetchData(deviceId) {
    // console.log({ deviceId, authToken });
    fetch(
      `https://lgdms.livguard.com/dashboard/primary-data/${deviceId}/${authToken}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        data = data[0] || {
          latest_updated_time: "00:00",
          device_log_date: Date(),
          v1: "0",
          v2: "0",
          v3: "0",
          v4: "0",
          current: "0",
          temperature: "0",
          speed: "0",
        };
        dashboardContainer.innerHTML = `
    <div class="row">
      <div class="col-lg-12">
        <div class="ds_ttl_blk">
          <h1 class="dh1">Device Parameters</h1>
          <p class="dp1">
            View/download detailed device parameters for multiple data points
          </p>
        </div>
      </div>
    </div>

    <div
      class="container-fluid mb-3"
      style="border-top: 1px solid #4a5154; opacity: 30%"
    ></div>

    <div class="d-flex justify-content-between">
      <div class="card-container">
        <div class="d-flex align-items-center">
          <h1 class="dh1 lr_margin_10">Customer Name - <span id="vendorName"></span></h1>
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center; border:1px solid balck">
            ${currentStatus(
              formatDate(data.device_log_date),
              data.latest_updated_time
            )}
            ${
              toSetAlert(tempAlerData, {
                v1: data.v1,
                v2: data.v2,
                v3: data.v3,
                v4: data.v4,
              }).outerHTML
            }
          </div>
          
          <div class="verticle_divide lr_margin_10"></div>
          <h1 class="dh1 lr_margin_10">Device Id-
            <select id="devices" name="devices" style="border: none; outline: none">
              <option value="00000000">________</option>
              
            </select>
          </h1>
          

          <!--<div class="verticle_divide lr_margin_10"></div>
          <h1 class="dh1 lr_margin_10">Alert</h1>
          <div
            class="round_container lr_margin_10"
            style="background-color: #00b562"
          ></div>-->
          <div class="verticle_divide lr_margin_10"></div>
          <h1 class="dh1 lr_margin_10">${
            data.latest_updated_time
          } ; ${formatDate(data.device_log_date)}</h1>
        </div>
      </div>
      <button class="btn" style="background-color: #00b562; color: white" onclick="window.location.href='alldevices.html'">
        Export Data Log
      </button>
      <a id="downloadLink" style="display: none;"></a>
    </div>

    <section class="mt-3">
      <!-- <div class="container-fluid"> -->
      <div class="row">
        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Voltage 1 (B1)</h5>
              <h6 class="ds_crd_h6">${data.v1}</h6>
              <!-- <p class="ds_crd_p2">
                  <i class="bi bi-arrow-up-short"></i> 6.7% Increase
                </p> -->
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg1">
              <img
                src="assets/img/voltage.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Voltage 2 (B2)</h5>
              <h6 class="ds_crd_h6">${data.v2}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg2">
              <img
                src="assets/img/voltage.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Voltage 3 (B3)</h5>
              <h6 class="ds_crd_h6">${data.v3}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg3">
              <img
                src="assets/img/voltage.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Voltage 4 (B4)</h5>
              <h6 class="ds_crd_h6">${data.v4}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg4">
              <img
                src="assets/img/voltage.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- </div> -->
    </section>

    <section class="mt-3">
      <!-- <div class="container-fluid"> -->
      
      <div class="row">
        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Battery BANK VOLTAGE</h5>
              <h6 class="ds_crd_h6">${(
                Number(data.v1) +
                Number(data.v2) +
                Number(data.v3) +
                Number(data.v4)
              ).toFixed(2)}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg4">
              <img
                src="assets/img/voltage.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">CURRENT (A)</h5>
              <h6 class="ds_crd_h6">${data.current}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg2">
              <img
                src="assets/img/current.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">TEMPERATURE (T)</h5>
              <h6 class="ds_crd_h6">${data.temperature} C</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg4">
              <img
                src="assets/img/temperature.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">Instantaneous Speed (KMPH)</h5>
              <h6 class="ds_crd_h6">${data.speed}</h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg4">
              <img
                src="assets/img/speed.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- </div> -->
    </section>

    <section class="mt-3">
      <!-- <div class="container-fluid"> -->
      <div class="row">
        <div class="col-lg-3">
          <div class="d-flex dsh_crd_bg">
            <div class="">
              <h5 class="ds_crd_p1">DISTANCE (KM)</h5>
              <h6 class="ds_crd_h6" id="distance"></h6>
            </div>
            <div class="dsh_crd_icn_blk dsh_icn_bg4">
              <img
                src="assets/img/distance.svg"
                class="img-fluid dsh_crd_icn"
                style="margin-top: -8px"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- </div> -->
    </section>

    <!-- card -->

    <div
      class="container-fluid mb-3 mt-3"
      style="border-top: 1px solid #4a5154; opacity: 30%"
    ></div>

    <!-- table-top -->
    <div class="col">
      <div
        class="container-fluid"
        style="
          background-color: white;
          padding-left: 5px;
          padding-top: 3px;
          padding-bottom: 3px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        "
      >
        <h1 class="dh1">Map View</h1>
        <div id="map" style="height: 700px; width: 100%;"></div>
      </div>
    </div>`;
        customers = ["Livguard", "Mesha", "Race", "Korakso"];
        deviceId = localStorage.getItem("selectedDeviceId");
        customerId = localStorage.getItem("customerId");
        document.getElementById("vendorName").innerHTML =
          customers[parseInt(customerId) - 1];
        // console.log("deviceId", deviceId);
        fetchDistance(deviceId, authToken);
        fetchDeviceIds(customerId, authToken);
        initMap(data.lat, data.long);
        let selectDevice = document.getElementById("devices");
        selectDevice.addEventListener("change", (event) => {
          localStorage.setItem("selectedDeviceId", event.target.value);
          fetchData(event.target.value);
        });
        // export data
        // let exportDataBtn = document.getElementById("exportDataBtn");
        // exportDataBtn.addEventListener("click", function () {
        //   // console.log("clicked");
        //   const link = document.getElementById("downloadLink");
        //   link.href = `https://lgdms.livguard.com/download/csv/today/${authToken}`;
        //   link.click();
        // });
        // export data
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  fetchData(savedDeviceId);
  // setInterval(function () {
  //   fetchData(savedDeviceId);
  // }, 30000);
  setInterval(function () {
    const currentDeviceId = localStorage.getItem("selectedDeviceId");
    if (currentDeviceId) {
      fetchData(currentDeviceId);
    }
  }, 30000);
  let selectDevice = document.getElementById("devices");
  let selectDeviceId = localStorage.getItem("selectedDeviceId");
  if (selectDeviceId) {
    selectDevice.value = selectDeviceId;
  }
  selectDevice.addEventListener("change", (event) => {
    localStorage.setItem("selectedDeviceId", event.target.value);
    fetchData(event.target.value);
    fetchDistance(localStorage.getItem("selectedDeviceId"), authToken);
  });
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

function fetchDeviceIds(customerId, authToken) {
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
                        <td>${item["Duration - Hours"]}</td>
                        <td>${item["Temperature - Max"]}</td>
                        <td>${item["Temperature - Min"]}</td>
                        <td>${item["ah"]}</td>
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
