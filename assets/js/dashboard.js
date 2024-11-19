document.addEventListener("DOMContentLoaded", function () {
  const dashboardContainer = document.getElementById("dashboardContainer");
  const authToken = localStorage.getItem("authToken");
  const savedDeviceId = localStorage.getItem("selectedDeviceId") || "MESH0001";
  function fetchData(deviceId) {
    // console.log({ deviceId, authToken });
    fetch(
      `https://dms.meshaenergy.com/apis/dashboard/primary-data/${deviceId}/${authToken}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        data = data[0];
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
          <div class="color_box lr_margin_10" style="background-color: #00b562">
            <p>Online</p>
          </div>
          
          <div class="verticle_divide lr_margin_10"></div>
          <h1 class="dh1 lr_margin_10">Device Id-
            <select id="devices" name="devices" style="border: none; outline: none">
              <option value="MESH0000">MESH____</option>
              
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
        customers = ['Livguard','Mesha','Race','Korakso'];
        deviceId = localStorage.getItem("selectedDeviceId");
        customerId = localStorage.getItem("customerId");
        document.getElementById('vendorName').innerHTML = customers[parseInt(customerId) - 1];
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
        //   link.href = `https://dms.meshaenergy.com/apis/download/csv/today/${authToken}`;
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
    window.location.href = "index.html";
  }
}
window.onload = checkAuth;

// Add logout event listener
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("authToken");
  localStorage.clear();
  window.location.href = "index.html";
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
  fetch(
    `https://dms.meshaenergy.com/apis/devices/all/${customerId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      optionsTemplet = ``;
      data.forEach((element) => {
        optionsTemplet += `<option value="${element.device_id}">${element.device_id}</option>`;
      });
      document.getElementById("devices").innerHTML = optionsTemplet;
      
        let currentDeviceId = localStorage.getItem("selectedDeviceId");
        if (!currentDeviceId) {
            localStorage.setItem("selectedDeviceId", data[0].device_id);
        }
         document.getElementById("devices").value = localStorage.getItem("selectedDeviceId");
         
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
    `https://dms.meshaenergy.com/apis/distance-travelled/${deviceId}/${authToken}`,
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
    
    chargeDischargeDisplay(localStorage.getItem("selectedDeviceId"),localStorage.getItem("authToken"));
}


chargeDischargeDisplay(localStorage.getItem("selectedDeviceId"),localStorage.getItem("authToken"));

function chargeDischargeDisplay(deviceId, authToken) {
    
   var tableBody = document.getElementById('data-table-body');
   tableBody.innerHTML = '';
    
  fetch(
    `https://dms.meshaenergy.com/apis/dashboard/charge_discharge/csv/date-range/${deviceId}/${authToken}`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // console.log("Success: ++++++++++++++++++ ", data);
            
            
            // Loop through the data and create table rows
            data.forEach(item => {
                
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