document.getElementById("app-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const apiKey = document.getElementById("api-key").value;
    const cfgFileInput = document.getElementById("cfg-file");
    const log = document.getElementById("log");
  
    if (!apiKey || !cfgFileInput.files[0]) {
      log.value = "Please provide an API key and upload a valid fivem.cfg file.";
      return;
    }
  
    log.value = "Fetching vehicle data from the API...\n";
  
    try {
      // Fetch vehicle data from the API
      const playerData = await fetchPlayerData(apiKey);
      log.value += "Vehicle data fetched successfully.\n";
  
      // Fetch the vehicle configuration file
      const vehicleConfig = await fetch("vehicle-config.json").then((res) => res.json());
  
      // Read and update the uploaded cfg file
      const cfgFile = await cfgFileInput.files[0].text();
      const updatedCfg = updateFivemCfg(cfgFile, playerData, vehicleConfig, log);
  
      // Allow the user to download the updated file
      const downloadBtn = document.getElementById("download-btn");
      downloadBtn.style.display = "inline-block";
      downloadBtn.addEventListener("click", () => downloadFile("fivem.cfg", updatedCfg));
    } catch (error) {
      log.value += `Error: ${error.message}\n`;
    }
  });
  
  async function fetchPlayerData(apiKey) {
    const url = "http://tycoon-2epova.users.cfx.re/map/positions.json";
  
    const response = await fetch(url, {
      headers: { "X-Tycoon-Key": apiKey },
    });
  
    if (!response.ok) {
      throw new Error(`API Request failed with status: ${response.status}`);
    }
  
    return await response.json();
  }
  
  function updateFivemCfg(cfgContent, playerData, vehicleConfig, log) {
    let updatedContent = cfgContent;
  
    for (const player of playerData.players) {
      const vehicleSpawn = player[4]?.vehicle_spawn;
  
      if (vehicleSpawn && vehicleConfig[vehicleSpawn]) {
        const fov = vehicleConfig[vehicleSpawn];
        log.value += `Detected vehicle: ${vehicleSpawn}. Updating FOV to ${fov}.\n`;
  
        updatedContent = updatedContent.replace(
          /seta "cam_vehicleFirstPersonFOV" "\d+\.\d+"/,
          `seta "cam_vehicleFirstPersonFOV" "${fov.toFixed(6)}"`
        );
        break; // Update only the first matching vehicle
      }
    }
  
    if (updatedContent === cfgContent) {
      log.value += "No matching vehicle found. No changes made.\n";
    }
  
    return updatedContent;
  }
  
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
  