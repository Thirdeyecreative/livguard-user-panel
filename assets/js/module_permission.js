document.addEventListener("DOMContentLoaded", async function () {
  const modulesData = await fetchModulesData();
  console.log({ modulesData });

  if (modulesData) {
    const allowedModules = JSON.parse(localStorage.getItem("moduleList")) || [];

    const currentPageFileName = window.location.pathname.split("/").pop(); // Extract the file name from the URL

    // Check if the current page's file_name exists in the allowed modules
    const isPageAllowed = modulesData.some(
      (module) =>
        allowedModules.includes(module.id) &&
        module.file_name === currentPageFileName
    );

    if (!isPageAllowed) {
      const firstAllowedModule = modulesData.find((module) =>
        allowedModules.includes(module.id)
      );
      if (firstAllowedModule) {
        window.location.href = `/${firstAllowedModule.file_name}`;
      } else {
        window.location.href = "/";
      }
    }

    // Get all the links in the sidebar
    const sidebarLinks = document.querySelectorAll("#sidebarMenu .nav-link");

    // Show only the allowed links and hide the rest
    sidebarLinks.forEach((link) => {
      const fileName = link.getAttribute("href");

      const isAllowed = modulesData.some(
        (module) =>
          allowedModules.includes(module.id) && module.file_name === fileName
      );
      // console.log({ isAllowed, fileName: fileName === "index.html" });
      const parentNavItem = link.closest(".nav-item");
      if (isAllowed || fileName === "index.html") {
        // If the link is allowed, display it
        link.style.display = "flex"; // Make the allowed link visible
        parentNavItem.style.display = "";
      } else {
        // Otherwise, hide the link
        link.style.display = "none";
        parentNavItem.style.display = "none";
      }
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
