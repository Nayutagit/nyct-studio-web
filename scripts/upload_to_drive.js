const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function uploadToDrive(filePath) {
    console.log(`Starting upload process for: ${filePath}`);

    // Load credentials from environment variable (JSON string)
    const credentialsJson = process.env.GDRIVE_CREDENTIALS;
    const folderId = process.env.GDRIVE_FOLDER_ID;

    if (!credentialsJson || !folderId) {
        console.error('Missing GDRIVE_CREDENTIALS or GDRIVE_FOLDER_ID environment variables.');
        process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    try {
        const credentials = JSON.parse(credentialsJson);

        // Authenticate with Google API
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Get file name and setup metadata
        const fileName = path.basename(filePath);
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: 'image/png', // Explicitly setting for PNG images
            body: fs.createReadStream(filePath)
        };

        console.log('Uploading to Google Drive...');
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });

        console.log(`Successfully uploaded!`);
        console.log(`File ID: ${response.data.id}`);
        console.log(`View Link: ${response.data.webViewLink}`);

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        process.exit(1);
    }
}

// Find the latest image in the output directory
const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '../_output');
const todayStr = new Date().toISOString().split('T')[0];
const targetFile = path.join(outputDir, `story_${todayStr}.png`);

uploadToDrive(targetFile);
