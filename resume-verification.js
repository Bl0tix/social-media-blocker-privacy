document.addEventListener('DOMContentLoaded', function() {
    // Force color theme through JavaScript
    document.documentElement.style.backgroundColor = "#2A2A28";
    document.body.style.backgroundColor = "#2A2A28";
    
    // Ensure container colors
    document.querySelectorAll('.container').forEach(element => {
      element.style.backgroundColor = "#333331";
    });
    
    const resumeBtn = document.getElementById('resumeBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Resume button
    resumeBtn.addEventListener('click', function() {
      // Set the paused state to false
      chrome.storage.local.set({isPaused: false}, function() {
        // Notify the background script about the state change
        chrome.runtime.sendMessage({action: 'togglePause', isPaused: false});
        
        // Redirect back to dashboard
        window.location.href = 'dashboard.html';
      });
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
      window.close();
    });
  });