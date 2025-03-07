document.addEventListener('DOMContentLoaded', function() {
    const dashboardBtn = document.getElementById('dashboardBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const statusSpan = document.querySelector('#status span');
  
    // Check current state and update UI
    chrome.storage.local.get(['isPaused'], function(result) {
      const isPaused = result.isPaused || false;
      updateStatusUI(isPaused);
    });
  
    // Dashboard button opens dashboard.html
    dashboardBtn.addEventListener('click', function() {
      chrome.tabs.create({url: 'dashboard.html'});
    });
  
    // Pause button toggles blocking functionality
    pauseBtn.addEventListener('click', function() {
      chrome.storage.local.get(['isPaused'], function(result) {
        const isPaused = result.isPaused || false;
        const newState = !isPaused;
        
        chrome.storage.local.set({isPaused: newState}, function() {
          updateStatusUI(newState);
          
          // Notify the background script about the state change
          chrome.runtime.sendMessage({action: 'togglePause', isPaused: newState});
        });
      });
    });
  
    function updateStatusUI(isPaused) {
      if (isPaused) {
        statusSpan.textContent = 'Paused';
        statusSpan.className = 'paused';
        pauseBtn.textContent = 'Resume';
      } else {
        statusSpan.textContent = 'Active';
        statusSpan.className = 'active';
        pauseBtn.textContent = 'Pause';
      }
    }
  });