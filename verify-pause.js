document.addEventListener('DOMContentLoaded', function() {
    // Force color theme through JavaScript
    document.documentElement.style.backgroundColor = "#2A2A28";
    document.body.style.backgroundColor = "#2A2A28";
    
    // Ensure container colors
    document.querySelectorAll('.container').forEach(element => {
      element.style.backgroundColor = "#333331";
    });
    
    document.querySelectorAll('.password-container').forEach(element => {
      element.style.backgroundColor = "#333331";
    });
    
    const generatedPasswordElem = document.getElementById('generatedPassword');
    const verificationInput = document.getElementById('verificationInput');
    const verifyBtn = document.getElementById('verifyBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    // Generate a random 12-character password
    const password = generateRandomPassword(12);
    generatedPasswordElem.textContent = password;
    
    // Verification input event
    verificationInput.addEventListener('input', function() {
      // Check if input matches password
      if (verificationInput.value === password) {
        verifyBtn.disabled = false;
        statusMessage.style.display = 'none';
      } else {
        verifyBtn.disabled = true;
      }
    });
    
    // Verify button
    verifyBtn.addEventListener('click', function() {
      if (verificationInput.value === password) {
        // Set the paused state to true
        chrome.storage.local.set({isPaused: true}, function() {
          // Show success message
          statusMessage.textContent = 'Verification successful! Blocking is now paused.';
          statusMessage.className = 'status-message success';
          statusMessage.style.display = 'block';
          
          // Notify the background script about the state change
          chrome.runtime.sendMessage({action: 'togglePause', isPaused: true});
          
          // Redirect back to dashboard after a brief delay
          setTimeout(function() {
            window.location.href = 'dashboard.html';
          }, 2000);
        });
      } else {
        // Show error message
        statusMessage.textContent = 'Verification failed! Please try again.';
        statusMessage.className = 'status-message error';
        statusMessage.style.display = 'block';
      }
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
      window.close();
    });
    
    // Initialize verify button state
    verifyBtn.disabled = true;
    
    // Function to generate random password (simplified version)
    function generateRandomPassword(length) {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      
      // Ensure at least one uppercase, one lowercase, and one number
      password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      password += getRandomChar('abcdefghijklmnopqrstuvwxyz');
      password += getRandomChar('0123456789');
      
      // Fill the rest with random characters from the charset
      for (let i = password.length; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      
      // Shuffle the password characters
      return shuffleString(password);
    }
    
    function getRandomChar(charset) {
      return charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    function shuffleString(str) {
      const arr = str.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('');
    }
  });