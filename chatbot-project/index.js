const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

// Create an Express application
const app = express();
app.use(express.json());

const projectId = 'customer-ab9d'; // Replace with your actual Dialogflow project ID

// Create a session ID
const sessionId = uuid.v4();

// Setup Dialogflow session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(queryText, sessionId) {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: 'en-US',
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

// Route to handle incoming POST messages
app.post('/webhook', async (req, res) => {
    const { message } = req.body;
    try {
        const intentResponse = await detectIntent(message, sessionId);

        const result = intentResponse.queryResult;
        const intentName = result.intent.displayName;
        const responseText = result.fulfillmentText;

        res.json({
            intent: intentName,
            response: responseText,
        });
    } catch (error) {
        console.error('Error handling the request:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle GET requests for testing
app.get('/webhook', (req, res) => {
    res.send('This endpoint is intended to handle POST requests.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
