// ---------------------------------------------------------------
// CONFIGURATION
// We no longer need FLOW_URL since submission is handled by Web3Forms endpoint in HTML
//Final Vercel push test (please work)
const GAS_URL = "https://script.google.com/macros/s/AKfycbzkQawPk1xKIvW77DDsGs6urYJnYCXqFY7SE-qWEWoLfhIvlWpP-hv0JE9dipaZBFgb_g/exec";
                
// Personality descriptions based on taste preference
//const personalityDescriptions = {
//    "Sweet": "Balanced, comforting, and prioritizes harmony and kindness in all aspects of life.",
//    "Savoury": "Reliable, classic, deeply appreciates the fundamentals, and values time-tested methods.",
//    "Spicy": "Bold, adventurous, and always seeking the next thrilling experience."
//};
const personalityPosters = {
    "Sweet": "https://i.imgur.com/ZdQEF3a.jpg",
    "Savoury": "https://i.imgur.com/E7USHNV.jpg",
    "Spicy": "https://i.imgur.com/3WFAC6J.jpg"
};

// 1. Storage Variable for all user selections (Still used for validation)
const userChoices = {};

// Simple function to display temporary, non-blocking error message
// This replaces all uses of the problematic window.alert()
const displayMessage = (message, isError = true) => {
    // Find the current active step's navigation area
    const container = document.querySelector('.story-step.active .navigation-buttons');
    if (!container) return;

    let msgDiv = document.getElementById('temp-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'temp-message';
        // Basic styling for the message
        msgDiv.style.cssText = 'padding: 10px; margin-top: 15px; border-radius: 5px; font-weight: 600; text-align: center;';
        container.prepend(msgDiv);
    }
    
    msgDiv.textContent = message;
    // Visually distinguish error from success (though we only use this for errors)
    msgDiv.style.backgroundColor = isError ? '#fee2e2' : '#d1fae5';
    msgDiv.style.color = isError ? '#991b1b' : '#065f46';

    // Remove the message after 4 seconds
    setTimeout(() => {
        if (msgDiv) msgDiv.remove();
    }, 4000);
};

// Function to reset button visuals for a given group/step
const resetVisuals = (key, stepElement) => {
    // Use the step element to find only the buttons in the current step
    stepElement.querySelectorAll(`[data-key="${key}"]`).forEach(btn => {
        // Remove Tailwind classes used for the 'active' state
        btn.classList.remove('bg-red-600', 'border-red-600', 'shadow-xl'); 
        btn.classList.add('bg-gray-100', 'border-gray-300', 'shadow-md');
    });
};

// 2. Main function to handle step transition and data capture
document.addEventListener('DOMContentLoaded', () => {
    // Select all step containers and all 'Next' buttons
    //const form = document.getElementById('makanQuestForm');
    const allSteps = document.querySelectorAll('.story-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const submitButton = document.getElementById('submitQuestBtn'); // The new final button

    // Function to show a specific step
    const showStep = (targetStep) => {
        console.log('Attempting to show step:', targetStep);  // Debugging log
        allSteps.forEach(step => {
            // Hide all steps first
            step.classList.remove('active');
            // Show the target step
            if (step.getAttribute('data-step') === String(targetStep)) {
                step.classList.add('active');

                // Update the question indicator
                const indicator = document.getElementById('question-indicator');
                if (indicator) {
                    console.log('Setting indicator for step:', targetStep);
                    const stepNum = parseInt(targetStep);
                    if (targetStep >= 2 && targetStep <= 15) {
                        const questionNumber = stepNum - 1;
                        //const questionNumber = parseInt(targetStep) - 1;  // Step 2 = Q1, Step 3 = Q2, etc.
                        //console.log('questionNumber:', questionNumber);
                        indicator.textContent = `Q${questionNumber}/14`;  // e.g., Q1/10 for step 2
                        indicator.style.display = 'block';  // Show the indicator
                        console.log('Updated indicator to:', indicator.textContent);
                    } else {
                        indicator.textContent = '';  // Clear or hide for other steps
                        indicator.style.display = 'none';
                    }
                } else {
                    console.log('Question indicator element not found!');
                }
            }
        });

        // Existing green theme toggling (for smaller screens)
        if (targetStep === '0') {
            document.body.classList.add('start-bg');
            document.body.classList.remove('quest-bg');
        } else {
            document.body.classList.add('quest-bg');
            document.body.classList.remove('start-bg');
        }
        // NEW: Dynamic background toggling for bigger screens
        const storyContainer = document.querySelector('.story-container');
        if (targetStep === '0') {
            document.body.classList.add('start-bg-big');
            document.body.classList.remove('quest-bg-big');
            if (storyContainer) {
                storyContainer.classList.add('start-container-big');
                storyContainer.classList.remove('quest-container-big');
            }
        } else {
            document.body.classList.add('quest-bg-big');
            document.body.classList.remove('start-bg-big');
            if (storyContainer) {
                storyContainer.classList.add('quest-container-big');
                storyContainer.classList.remove('start-container-big');
            }
        }

        // Dynamic background toggling for iPad screens
        if (targetStep === '0') {
            document.body.classList.add('start-bg-ipad');
            document.body.classList.remove('quest-bg-ipad');
            if (storyContainer) {
                storyContainer.classList.add('start-container-ipad');
                storyContainer.classList.remove('quest-container-ipad');
            }
        } else {
            document.body.classList.add('quest-bg-ipad');
            document.body.classList.remove('start-bg-ipad');
            if (storyContainer) {
                storyContainer.classList.add('quest-container-ipad');
                storyContainer.classList.remove('start-container-ipad');
            }
        }
    };

    // Function to capture the selection from the current step
    const captureSelection = (currentStepElement) => {
        
        // Find the data-step attribute of the current element
        const currentStep = currentStepElement.getAttribute('data-step');

        // --- Skip validation for non-interactive steps (0, 1, 11) ---
        if (currentStep === '0' || currentStep === '1' || currentStep === '16') {
            return true; // No selection needed, always valid
        }
        
        // --- CAPTURE LOGIC FOR RADIO BUTTONS (Steps 2, 3, 4, 6, 7, 8, 9, 10) ---
        const radioChecked = currentStepElement.querySelector('input[type="radio"]:checked');
        
        // If radios exist on this step and one is checked, capture it.
        if (radioChecked) {
            const questionKey = radioChecked.name;
            userChoices[questionKey] = radioChecked.value;
            return true; // Valid selection made
        }
        
        // If radios exist but NONE is checked, validation fails for this step
        const allRadios = currentStepElement.querySelectorAll('input[type="radio"]');
        if (allRadios.length > 0 && !radioChecked) {
            const isGenderStep = allRadios[0] && allRadios[0].name === 'gender';
            const alertMsg = isGenderStep 
                ? 'Please select your gender before starting on the quest!' 
                : 'Please select one option to proceed.';
            
            displayMessage(alertMsg); // Using the custom message function instead of alert()
            return false;
        }

        // --- CAPTURE LOGIC FOR CHECKBOXES (Step 5: sides) ---
        const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"][name="sides"]');
        
        if (checkboxes.length > 0 && currentStep === '5') {
            const checkedValues = [];
            const questionKey = checkboxes[0].name;

            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkedValues.push(checkbox.value);
                }
            });

            // *** Checkbox validation logic ***
            if (checkedValues.length === 2) {
                userChoices[questionKey] = checkedValues.join(', '); // Store as comma-separated string
                return true; // Exactly 2 sides selected
            } else {
                displayMessage('You must choose EXACTLY two side dishes to proceed.');
                return false; // Not exactly 2 sides selected
            }
        }

        // --- Fallback for any steps that have inputs we missed or are purely decorative ---
        return true; 
    };

    // Add event listeners to inputs for immediate validation and message removal
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
            const currentStepElement = input.closest('.story-step');
            if (currentStepElement && currentStepElement.classList.contains('active')) {
                const isNowValid = captureSelection(currentStepElement);
                if (isNowValid) {
                    const msgDiv = document.getElementById('temp-message');
                    if (msgDiv) {
                        msgDiv.remove();  // Remove the message if the step is now valid
                    }
                }
            }
        });
    });

    // 3. Attach Event Listener to ALL next buttons (Regular Navigation)
    nextButtons.forEach(button => {
        // Exclude the new dedicated submit button from regular navigation
        // Note: The previous logic checked for 'saveDataButton', we now check for 'submitQuestBtn'
        if (button.id !== 'submitQuestBtn') { 
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const currentStepElement = button.closest('.story-step');
                const isSelectionValid = captureSelection(currentStepElement);

                if (isSelectionValid) {
                    const targetStep = button.getAttribute('data-target');
                    if (targetStep) {
                        showStep(targetStep);
                        console.log("Current Choices:", userChoices); 
                    }
                } 
            });
        }
    });

    // 4. Dedicated Event Listener for the Final Submit Button (Web3Forms Submission)
    // This replaces the old Power Automate form.addEventListener('submit', ...) block.
    //if (submitButton && GAS_URL && GAS_URL !== "https://script.google.com/macros/s/AKfycbwEUs4X_SJtUC3XTvLBchO3SFIsfDjyhDFbN3RTCYle9GwI0Qrjv8EdX4JKzKkM9WIP4A/exec") {
    if (submitButton && GAS_URL) {
        submitButton.addEventListener('click', async (event) => {
            
            event.preventDefault();
            
            const currentStepElement = submitButton.closest('.story-step');
            // 1. Validate and capture the final step's selection (Step 10)
            const isFinalSelectionValid = captureSelection(currentStepElement);

            if (!isFinalSelectionValid) {
                return; // Stop the process if the last selection is invalid
            }

            // Remove the message if the final selection is valid
            const msgDiv = document.getElementById('temp-message');
            if (msgDiv) {
                msgDiv.remove();  // Immediately remove the message
            }

            // 2. Set loading state
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            
            // CRITICAL: Get the Access Key from the hidden HTML input
            //const accessKeyInput = form.querySelector('input[name="access_key"]');
            //const accessKey = accessKeyInput ? accessKeyInput.value : '';

            // 3. Prepare the final JSON payload
            //const finalPayload = { ...userChoices };
            const finalPayload = new URLSearchParams(userChoices);
            // Optional: Log the clean payload for debugging
            console.log("Final JSON Payload for Google Sheets:", finalPayload.toString());
            //const finalPayload = {
                // REQUIRED: The Web3Forms access key must be included in the payload
                //'access_key': accessKey,
                
                // Add all choices captured throughout the quiz
                //...userChoices,
                
                // Optional: You can explicitly rename the Sides field here if needed.
                // Since userChoices already captures 'sides' as a clean key, this is fine.
                // Example: 'Chosen Side Dishes': userChoices.sides
            //};

            // Optional: Log the clean payload for debugging
            //console.log("Final JSON Payload for Web3Forms:", finalPayload);

            try {
                // 4. Send the data to Web3Forms as JSON
                // NOTE: Web3Forms supports receiving JSON directly.
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    body: finalPayload,
                    //headers: {
                        //'Content-Type': 'application/json', // Tell the server we are sending JSON
                        //'Accept': 'application/json'
                    //},
                    //body: JSON.stringify(finalPayload), // Send the JSON object
                });
                
                //const data = await response.json();
                // Check for success based on GAS return value
                const responseText = await response.text();
                let data = { result: "error", message: "Unknown response from script." };
                //let data = { success: false, message: "Unknown response from script.", result: "error" };

                try {
                    // Try to parse the response as JSON
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error("Failed to parse response JSON:", responseText, e);
                }
                    // Fallback: Check if the response is successful and contains the expected GAS success message
                    //if (response.ok && responseText.includes("Data appended")) {
                    //if (response.ok) {
                        //data.result = "success";
                        //data.success = true; 
                        //data.message = "Successfully written to Google Sheets.";
                    //} else {
                        //data.message = responseText;
                    //}
                //}

                //if (response.ok && data.success === "success") {
                if (response.ok && data.result === "success") {
                    // Submission successful!
                    console.log('Form data written successfully to Google Sheets.');

                    const tastePreference = userChoices["taste preference"];
                    const posterElement = document.getElementById('personality-poster');
                    if (posterElement) {
                        const posterUrl = personalityPosters[tastePreference];
                        if (posterUrl) {
                            posterElement.src = posterUrl;
                            posterElement.style.display = 'block';  // Show the image
                            posterElement.alt = `Personality Poster for ${tastePreference}`;  // Update alt text for accessibility
                        } else {
                            // Fallback: Hide or show a default poster if no match
                            posterElement.style.display = 'none';
                        }
                    }
                    //const descElement = document.getElementById('personality-desc');
                    //if (descElement) {
                    //    descElement.textContent = personalityDescriptions[tastePreference] || "a unique flavor explorer with taste yet to be defined!";
                    //}

                    // 5. Manually advance to the final thank-you step (data-step="11")
                    const targetStep = submitButton.getAttribute('data-target');
                    if (targetStep) {
                        showStep(targetStep);
                    }
                    
                } else {
                    // Handle submission failures
                    //displayMessage(`Submission failed: Check Console for details.'}`);
                    //console.error('Google Sheets submission error:', data.message);
                    // Use data.message from GAS for a more specific error, or a general message
                    const msg = data.message || `Submission failed. Script returned an error. Check console.`;
                    displayMessage(msg);
                    console.error('Google Sheets submission error:', data);
                }

            } catch (error) {
                // Handle network errors
                displayMessage('A network error occurred. Please check your connection.');
                console.error('Network error during Google Sheets submission:', error);
            } finally {
                // 6. Reset button state (only if we didn't successfully navigate away)
                if (submitButton.closest('.story-step.active')) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            }
        });
    } else if (submitButton) {
        // Warning if the URL is not configured
        submitButton.addEventListener('click', () => displayMessage("CRITICAL: Please configure the GAS_URL in script.js to enable submission."));
    }


    // OPTIONAL: Initial setup to ensure only Step 0 is shown on load
    showStep('0'); 
});