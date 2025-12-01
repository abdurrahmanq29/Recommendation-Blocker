chrome.storage.sync.get("blockedSites", function(data) {
  var blockedSites = data.blockedSites || [];
  var currentUrl = window.location.href;

  blockedSites.forEach(function(entry) {
    if (currentUrl.includes(entry.site)) {
      if (new Date().getTime() < entry.endTime) {
        // Empty the content of the page
        document.documentElement.innerHTML = "";
      } else {
        // Remove the site from blockedSites if the time has passed
        blockedSites = blockedSites.filter(item => item.site !== entry.site);
        chrome.storage.sync.set({ blockedSites: blockedSites });
      }
    }
  });
});