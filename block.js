document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('url');
  
  const timerElement = document.getElementById('timer');
  const continueBtn = document.getElementById('continueBtn');
  const blockedUrlElement = document.getElementById('blockedUrl');
  
  // Set a flag to track if the timer has completed
  let timerCompleted = false;
  
  // Display the blocked URL
  blockedUrlElement.textContent = 'URL: ' + (blockedUrl || 'Unknown');
  
  // Format URL for display (truncate if too long)
  if (blockedUrl && blockedUrl.length > 50) {
    blockedUrlElement.textContent = 'URL: ' + blockedUrl.substring(0, 50) + '...';
    blockedUrlElement.title = blockedUrl; // Show full URL on hover
  } else {
    blockedUrlElement.textContent = 'URL: ' + (blockedUrl || 'Unknown');
  }
  
  // Get timer value from URL params or use default
  const timerParam = urlParams.get('timer');
  let secondsLeft = timerParam ? parseInt(timerParam, 10) : 5;
  timerElement.textContent = secondsLeft;
  
  // Start countdown
  const countdown = setInterval(function() {
    secondsLeft--;
    timerElement.textContent = secondsLeft;
    
    if (secondsLeft <= 0) {
      clearInterval(countdown);
      continueBtn.disabled = false;
      timerCompleted = true;
      
      // Highlight the button to make it more obvious
      continueBtn.style.backgroundColor = '#34a853'; // Green color
      continueBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    }
  }, 1000);
  
  // Continue button
  continueBtn.addEventListener('click', function() {
    if (blockedUrl) {
      // Use location.replace instead of location.href to properly redirect
      window.location.replace(blockedUrl);
    }
  });
});