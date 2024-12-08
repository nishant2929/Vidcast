document.getElementById('submitButton').addEventListener('click', async () => {
    // Get text input
    const textBoxValue = document.getElementById('textBox').value.trim();
    
    // Validate input
    if (!textBoxValue) {
        alert("Please enter some text.");
        return;
    }

    // Get file input
    const fileInput = document.getElementById('pptUpload');
    const uploadedFile = fileInput.files[0];
    
    // Display output
    const outputDiv = document.getElementById('output');
    const textOutput = document.getElementById('textOutput');
    const fileOutput = document.getElementById('fileOutput');

    // Clear previous output
    textOutput.textContent = 'hi';
    fileOutput.textContent = '';

    // Validate and display appropriate messages
    if (textBoxValue) {
        textOutput.textContent = `Text: ${textBoxValue}`;
    } else {
        textOutput.textContent = 'No text provided';
    }

    if (uploadedFile) {
        fileOutput.textContent = `File Uploaded: ${uploadedFile.name}`;
    } else {
        fileOutput.textContent = 'No file uploaded';
    }
    
    // Show output div
    outputDiv.hidden = false;

    // Scroll to output section smoothly
    outputDiv.scrollIntoView({ behavior: 'smooth' });

    // Prepare the form data to send to the backend
    const formData = new FormData();
    formData.append('text', textBoxValue);
    
    if (uploadedFile) {
        formData.append('file', uploadedFile);
    }

    try {
        // Send POST request to the backend (server.js)
        const response = await fetch('/convertTextToSpeech', {
            method: 'POST',
            body: formData, // Send form data containing text and file
        });

        // Log the response for debugging
        console.log('Response from server:', response);

        // Check if the response is OK
        if (!response.ok) {
            const errorDetails = await response.text(); // Fetch error details as plain text
            console.error('Error response details:', errorDetails);
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json(); // Parse the response JSON
        console.log('Response data:', data); // Log the full data response for debugging

        // Check if audio URL is returned
        if (data.audioUrl) {
            const audioOutput = document.getElementById('audioOutput');
            audioOutput.src = data.audioUrl; // Set audio source to returned URL
            audioOutput.play(); // Automatically play the audio

            // Show output section
            outputDiv.hidden = false;
        } else {
            alert("Error generating audio: No audio URL returned.");
        }

    } catch (error) {
        console.error('Error caught in catch block:', error.message);
        alert(`Failed to convert text to speech. Error: ${error.message}`);
    }
});