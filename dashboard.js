document.addEventListener('DOMContentLoaded', function() {
  const websiteInput = document.getElementById('websiteInput');
  const addWebsiteBtn = document.getElementById('addWebsiteBtn');
  const websiteList = document.getElementById('websiteList');
  
  // Load saved websites
  loadWebsites();
  
  // Add new website
  addWebsiteBtn.addEventListener('click', function() {
    addWebsite();
  });
  
  // Also allow pressing Enter to add website
  websiteInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addWebsite();
    }
  });
  
  function addWebsite() {
    let url = websiteInput.value.trim();
    const timerValue = parseInt(document.getElementById('timerSelect').value, 10);
    
    if (url === '') {
      alert('Please enter a website URL');
      return;
    }
    
    // Remove http/https protocol if present
    url = url.replace(/^https?:\/\//, '');
    // Remove www. if present
    url = url.replace(/^www\./, '');
    // Remove path if present
    url = url.split('/')[0];
    
    chrome.storage.local.get(['blockedWebsites'], function(result) {
      const blockedWebsites = result.blockedWebsites || [];
      
      // Check if website already exists (compare only the URL part)
      const exists = blockedWebsites.some(site => {
        if (typeof site === 'object' && site.url) {
          return site.url === url;
        }
        return site === url; // Support for legacy format
      });
      
      if (exists) {
        alert('This website is already in your block list');
        return;
      }
      
      // Store website with its timer value
      blockedWebsites.push({
        url: url,
        timer: timerValue
      });
      
      chrome.storage.local.set({blockedWebsites: blockedWebsites}, function() {
        websiteInput.value = '';
        loadWebsites();
      });
    });
  }
  
  function loadWebsites() {
    chrome.storage.local.get(['blockedWebsites'], function(result) {
      const blockedWebsites = result.blockedWebsites || [];
      
      websiteList.innerHTML = '';
      
      if (blockedWebsites.length === 0) {
        websiteList.innerHTML = '<p style="text-align: center; color: #666;">No websites added yet</p>';
        return;
      }
      
      blockedWebsites.forEach(function(website) {
        const websiteItem = document.createElement('div');
        websiteItem.className = 'website-item';
        
        // Handle both old format (string) and new format (object)
        let url, timer;
        if (typeof website === 'object' && website.url) {
          url = website.url;
          timer = website.timer || 5;
        } else {
          url = website;
          timer = 5; // Default for legacy entries
        }
        
        // Website info container
        const websiteInfo = document.createElement('div');
        websiteInfo.className = 'website-info';
        
        // Website name
        const websiteName = document.createElement('div');
        websiteName.className = 'website-name';
        websiteName.textContent = url;
        
        // Timer info
        const timerInfo = document.createElement('div');
        timerInfo.className = 'timer-info';
        timerInfo.textContent = `Delay: ${timer} seconds`;
        
        // Add edit timer select
        const timerSelect = document.createElement('select');
        timerSelect.className = 'edit-timer';
        [3, 5, 10, 15, 30].forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = `${value} seconds`;
          if (value === timer) {
            option.selected = true;
          }
          timerSelect.appendChild(option);
        });
        
        timerSelect.addEventListener('change', function() {
          updateWebsiteTimer(url, parseInt(this.value, 10));
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
          removeWebsite(url);
        });
        
        // Add elements to container
        websiteInfo.appendChild(websiteName);
        websiteInfo.appendChild(timerInfo);
        
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'website-controls';
        controlsContainer.appendChild(timerSelect);
        controlsContainer.appendChild(deleteBtn);
        
        websiteItem.appendChild(websiteInfo);
        websiteItem.appendChild(controlsContainer);
        websiteList.appendChild(websiteItem);
      });
    });
  }
  
  function updateWebsiteTimer(websiteUrl, newTimer) {
    chrome.storage.local.get(['blockedWebsites'], function(result) {
      let blockedWebsites = result.blockedWebsites || [];
      
      // Find and update the website timer
      blockedWebsites = blockedWebsites.map(website => {
        if ((typeof website === 'object' && website.url === websiteUrl) || 
            (typeof website === 'string' && website === websiteUrl)) {
          return {
            url: websiteUrl,
            timer: newTimer
          };
        }
        return website;
      });
      
      chrome.storage.local.set({blockedWebsites: blockedWebsites}, function() {
        loadWebsites();
      });
    });
  }
  
  function removeWebsite(websiteToRemove) {
    chrome.storage.local.get(['blockedWebsites'], function(result) {
      let blockedWebsites = result.blockedWebsites || [];
      
      blockedWebsites = blockedWebsites.filter(website => {
        if (typeof website === 'object' && website.url) {
          return website.url !== websiteToRemove;
        }
        return website !== websiteToRemove;
      });
      
      chrome.storage.local.set({blockedWebsites: blockedWebsites}, function() {
        loadWebsites();
      });
    });
  }
});