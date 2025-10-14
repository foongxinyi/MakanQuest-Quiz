// ---------------------------------------------------------------
// CONFIGURATION
// !!! REPLACE THIS WITH THE ACTUAL URL FROM YOUR POWER AUTOMATE FLOW !!!
const FLOW_URL = "YOUR_POWER_AUTOMATE_HTTP_TRIGGER_URL_GOES_HERE"; 
// ---------------------------------------------------------------

// 1. Storage Variable for all user selections
const userChoices = {};

// 2. Main function to handle step transition and data capture
document.addEventListener('DOMContentLoaded', () => {
    // Select all step containers and all 'Next' buttons
    const form = document.getElementById('makanQuestForm');
    const allSteps = document.querySelectorAll('.story-step');
    const nextButtons = document.querySelectorAll('.next-btn');

    // Function to show a specific step
    const showStep = (targetStep) => {
        allSteps.forEach(step => {
            // Hide all steps first
            step.classList.remove('active');
            // Show the target step
            if (step.getAttribute('data-step') === String(targetStep)) {
                step.classList.add('active');
            }
        });
    };

    // Function to capture the selection from the current step
    const captureSelection = (currentStepElement) => {
        
        // Find the data-step attribute of the current element
        const currentStep = currentStepElement.getAttribute('data-step');

        // --- NEW FIX: Skip validation for non-interactive steps (0, 1, 11) ---
        if (currentStep === '0' || currentStep === '1' || currentStep === '11') {
            return true; // No selection needed, always valid
        }
        // --- END NEW FIX ---

        // --- CAPTURE LOGIC FOR RADIO BUTTONS (Steps 2, 3, 4, 6, 7, 8, 9, 10) ---
        // UNCOMMENTED: This was causing ReferenceError!
        const radioChecked = currentStepElement.querySelector('input[type="radio"]:checked');
        
        // If radios exist on this step and one is checked, capture it.
        if (radioChecked) {
            const questionKey = radioChecked.name;
            userChoices[questionKey] = radioChecked.value;
            return true; // Valid selection made
        }
        
        // If radios exist but NONE is checked, validation fails for this step
        // IMPROVEMENT: Make alert step-specific (customize based on radio name, e.g., "gender")
        const allRadios = currentStepElement.querySelectorAll('input[type="radio"]');
        if (allRadios.length > 0 && !radioChecked) {
            // Detect if it's the gender step and customize (adjust 'gender' to match your name attr)
            const isGenderStep = allRadios[0] && allRadios[0].name === 'gender';
            const alertMsg = isGenderStep 
                ? 'Please select your gender before starting on the quest!' 
                : 'Please select one option to proceed.';
            alert(alertMsg);
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
                alert('You must choose EXACTLY two side dishes to proceed.');
                return false; // Not exactly 2 sides selected
            }
        }

        // --- Fallback for any steps that have inputs we missed or are purely decorative ---
        return true; 
    };

    // 3. Attach Event Listener to ALL next buttons (Regular Navigation)
    nextButtons.forEach(button => {
        // We only attach the generic click listener to buttons that are NOT the submit button.
        // The final submit button will use the form.addEventListener('submit', ...) below.
        if (button.id !== 'saveDataButton') { 
            button.addEventListener('click', (event) => {
                // FIX: Prevent default and stop propagation to block accidental form submit
                event.preventDefault();
                event.stopPropagation();
                
                // Get the current step element (the parent .story-step div)
                const currentStepElement = button.closest('.story-step');
                
                // Check if a selection was made (if required for this step)
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

    // 4. Dedicated Event Listener for the Final Submit Button (Type="submit")
    //if (form) {
        //form.addEventListener('submit', function(event) {
            // 1. Prevent default form submission (browser navigating away)
            //event.preventDefault(); 
            
            // FIX: Only proceed if we're actually on the final step (avoids early triggers)
            //const submitButton = document.getElementById('saveDataButton');
            //if (!submitButton || !submitButton.closest('.story-step.active')) {
            //    console.warn('Submit triggered from wrong step; ignoring.');
            //    return; // Bail out if not on final step
            //}
            
            // 2. Validate and capture the final step's selection (Step 10)
            //const currentStepElement = submitButton.closest('.story-step');
            //const isFinalSelectionValid = captureSelection(currentStepElement);

            //if (!isFinalSelectionValid) {
                // Stop the process if the last selection is invalid
            //    return;
            //}

            // 3. Prepare data for Power Automate
            //const finalPayload = {};
            
            // Clean up keys for Power Automate/Dataverse naming convention (e.g., "taste preference" -> "tastePreference")
            //for (const key in userChoices) {
            //    const cleanKey = key.replace(/([a-z])\s+([a-z])/ig, (match, p1, p2) => p1 + p2.toUpperCase());
            //    finalPayload[cleanKey] = userChoices[key];
            //}
            
            //console.log("Final Payload for Flow:", finalPayload);

            // 4. Send Data to Power Automate
            //fetch(FLOW_URL, {
            //    method: 'POST',
            //    headers: {
            //        'Content-Type': 'application/json' 
            //    },
            //    body: JSON.stringify(finalPayload) 
            //})
            //.then(response => {
            //    if (response.ok) {
            //        console.log('Form data successfully sent to Power Automate (Status 202 Accepted).');
                    
                    // CRITICAL FIX: Manually call the step navigation upon success
            //        const targetStep = submitButton.getAttribute('data-target');
            //        if (targetStep) {
            //            showStep(targetStep); // Show the thank you screen (Step 11)
            //        }
                    
            //    } else {
            //        console.error('Flow trigger failed with status:', response.status);
            //        alert('Error submitting data. The flow may have failed.');
            //    }
            //})
            //.catch(error => {
            //    console.error('Network or CORS error during submission:', error);
            //    alert('A connection error occurred. Check the console for details.');
            //});
        //});
    //}

    // OPTIONAL: Initial setup to ensure only Step 0 is shown on load
    showStep('0'); 
});
