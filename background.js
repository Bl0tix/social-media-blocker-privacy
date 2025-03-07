// Initialize default state
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get(['blockedWebsites'], function(result) {
    const existingWebsites = result.blockedWebsites || [];
    
    // Convert any existing websites to the new format if needed
    const updatedWebsites = existingWebsites.map(site => {
      if (typeof site === 'string') {
        return {
          url: site,
          timer: 5 // Default timer
        };
      }
      return site;
    });
    
    chrome.storage.local.set({
      blockedWebsites: updatedWebsites,
      isPaused: false
    });
  });
});

// Track tabs that have already been processed to prevent infinite loops
const processedTabs = new Map();

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Only check main frame navigation (not iframes, etc.)
  if (details.frameId !== 0) return;
  
  // Get the current time
  const currentTime = Date.now();
  
  // Check if this tab was recently processed (within the last 10 seconds)
  const lastProcessed = processedTabs.get(details.tabId);
  if (lastProcessed && (currentTime - lastProcessed) < 10000) {
    // This tab was recently redirected, so don't process it again
    return;
  }
  
  // Skip our own block page
  if (details.url.startsWith(chrome.runtime.getURL('block.html'))) {
    return;
  }
  
  chrome.storage.local.get(['blockedWebsites', 'isPaused'], function(result) {
    const blockedWebsites = result.blockedWebsites || [];
    const isPaused = result.isPaused || false;
    
    // Skip if extension is paused
    if (isPaused) return;
    
    const url = new URL(details.url);
    const domain = url.hostname.replace(/^www\./, '');
    
    // Check if the current website is in the blocked list
    for (const blockedSite of blockedWebsites) {
      // Support both old format (string) and new format (object)
      const siteToCheck = typeof blockedSite === 'object' ? blockedSite.url : blockedSite;
      
      if (domain.includes(siteToCheck)) {
        // Mark this tab as processed
        processedTabs.set(details.tabId, currentTime);
        
        // Set a timeout to clean up the processedTabs map after 10 seconds
        setTimeout(() => {
          processedTabs.delete(details.tabId);
        }, 10000);
        
        // Get timer value for this website
        let timerValue = 5; // Default
        if (typeof blockedSite === 'object' && blockedSite.timer) {
          timerValue = blockedSite.timer;
        }
        
        // Redirect to the block page with timer value
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('block.html') + 
               '?url=' + encodeURIComponent(details.url) + 
               '&timer=' + timerValue
        });
        break;
      }
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'togglePause') {
    // No action needed here as the state is already saved in storage
    // by the popup.js before sending this message
    sendResponse({success: true});
  }
});