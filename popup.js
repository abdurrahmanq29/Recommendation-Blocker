document.addEventListener("DOMContentLoaded", function () {
  var addUrlButton = document.getElementById("addUrlButton");
  var startBlockButton = document.getElementById("startBlock");

  addUrlButton.addEventListener("click", function () {
    chrome.storage.sync.get("blockedSites", function (data) {
      var blockedSites = data.blockedSites || [];
      var urlInput = document.getElementById("urlInput").value.trim();

      if (urlInput && !blockedSites.some(site => site.site === urlInput)) {
        blockedSites.push({ site: urlInput });
        chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
          updateBlockedList();
        });
      }
    });
  });

  startBlockButton.addEventListener("click", function () {
    var urlInput = document.getElementById("urlInput").value.trim();
    var hoursInput = parseInt(document.getElementById("hours").value, 10) || 0;
    var minutesInput = parseInt(document.getElementById("minutes").value, 10) || 0;

    if (urlInput && (hoursInput > 0 || minutesInput > 0)) {
      var blockDuration = (hoursInput * 60 + minutesInput) * 60000; // Convert to milliseconds
      var blockEndTime = Date.now() + blockDuration;

      chrome.storage.sync.get("blockedSites", function (data) {
        var blockedSites = data.blockedSites || [];
        var siteEntry = blockedSites.find(site => site.site === urlInput);

        if (siteEntry) {
          siteEntry.endTime = blockEndTime;
        } else {
          blockedSites.push({ site: urlInput, endTime: blockEndTime });
        }

        chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
          updateBlockedList();
        });
      });

      document.getElementById("urlInput").value = "";
      document.getElementById("hours").value = "0";
      document.getElementById("minutes").value = "0";

      startBlockingSites();
    }
  });

  function updateBlockedList() {
    chrome.storage.sync.get("blockedSites", function (data) {
      var blockedSites = data.blockedSites || [];
      var blockedSitesList = document.getElementById("blockedSitesList");
      blockedSitesList.innerHTML = "";

      blockedSites.forEach(function (entry) {
        var li = document.createElement("li");
        var blockStatus = entry.endTime && Date.now() < entry.endTime
          ? ` (until ${new Date(entry.endTime).toLocaleTimeString()})`
          : " (blocking inactive)";
        li.textContent = `${entry.site}${blockStatus}`;

        var removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-button";
        removeButton.addEventListener("click", function () {
          chrome.storage.sync.get("blockedSites", function (data) {
            var blockedSites = data.blockedSites || [];
            var index = blockedSites.findIndex(item => item.site === entry.site);
            if (index !== -1) {
              blockedSites.splice(index, 1);
              chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
                updateBlockedList();
              });
            }
          });
        });

        li.appendChild(removeButton);
        blockedSitesList.appendChild(li);
      });
    });
  }

  function startBlockingSites() {
    chrome.storage.sync.get("blockedSites", function (data) {
      var blockedSites = data.blockedSites || [];
      var currentUrl = window.location.href;

      blockedSites.forEach(function (entry) {
        if (currentUrl.includes(entry.site)) {
          if (!entry.endTime || Date.now() < entry.endTime) {
            document.documentElement.innerHTML = "";
          }
        }
      });
    });
  }

  updateBlockedList();
});
