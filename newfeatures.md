# Automated Content Ingestion for NewsFlash AI

This document outlines how to connect external services like Google Drive and Mattermost to your NewsFlash AI application. The goal is to automate the process of capturing valuable information (meeting notes, transcripts, key conversations) and adding it to your central knowledge repository.

All automations will use the secure `/api/ingest` endpoint built into the application.

---

## Part 1: Automating Ingestion from Google Drive with n8n

This workflow will automatically fetch new documents from a specific Google Drive folder, extract their content, and send it to NewsFlash AI. This is perfect for centralizing meeting notes, project plans, or any other text-based documents.

### **Goal**

- When a new file (e.g., Google Doc, `.txt`, `.md`) is added to a specific folder in Google Drive, automatically create a new source in NewsFlash AI.

### **Prerequisites**

1.  An **n8n Instance**: This can be a cloud account or a self-hosted version.
2.  **Google Credentials**: You'll need to connect your Google account to n8n.
3.  **NewsFlash AI Credentials**:
    *   The public URL of your deployed NewsFlash AI application (e.g., `https://your-app.apphosting.dev`).
    *   Your `INGEST_API_KEY` from your `.env.local` file.

### **Step-by-Step n8n Workflow**

This workflow consists of three main nodes:

1.  **Google Drive Trigger**: Watches for new files.
2.  **Google Drive Node**: Downloads the file content.
3.  **HTTP Request Node**: Sends the content to NewsFlash AI.

#### **Step 1: Set Up the Google Drive Trigger Node**

This node will start the workflow whenever a new file appears in your target folder.

1.  Create a new workflow in n8n and add a **Google Drive Trigger** node.
2.  **Authentication**: Connect your Google account if you haven't already.
3.  **Event**: Choose "**File Created**".
4.  **Folder ID**: In Google Drive, open the folder you want to monitor and copy the ID from the URL.
    *   Example URL: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
    *   Your Folder ID is `1a2b3c4d5e6f7g8h9i0j`.
5.  **Test the Trigger**: Add a new file to your Google Drive folder and click "Test step" to ensure the trigger fires and fetches the file's metadata.

#### **Step 2: Set Up the Google Drive "Download File" Node**

The trigger only provides metadata. This node downloads the actual content.

1.  Add a **Google Drive** node (the action, not the trigger).
2.  **Resource**: Select "**File**".
3.  **Operation**: Select "**Download**".
4.  **File ID**: Use an n8n expression to get the ID from the trigger node.
    *   Click the "Expression" button and select: `Nodes` > `Google Drive Trigger` > `Output Data` > `JSON` > `id`.
    *   The expression should look like: `{{ $json.id }}`.
5.  **Export as**: For Google Docs, choose **Plain Text** (`text/plain`). For other file types, leave it as the default.
6.  **Test the Node**: Run a test to confirm that it downloads the file content.

#### **Step 3: Set Up the HTTP Request Node**

This final node sends the downloaded content to your application's API.

1.  Add an **HTTP Request** node.
2.  **URL**: Enter the full URL for your ingestion endpoint:
    *   `https://<your-app-url>/api/ingest`
3.  **Authentication**: Select "**Header Auth**".
4.  **Name**: Enter `Authorization`.
5.  **Value**: Enter `Bearer <YOUR_INGEST_API_KEY>`. Replace `<YOUR_INGEST_API_KEY>` with your actual secret key.
6.  **Body Content Type**: Select "**JSON**".
7.  **Body**: You need to construct a JSON object with a `documentContent` field.
    *   Click "Add Expression" for the `documentContent` value.
    *   Select: `Nodes` > `Google Drive (Download)` > `Output Data` > `Binary` > `data`.
    *   The expression will be `{{ $binary.data }}`. This correctly passes the text content.
    *   You can also pass the original URL by adding a `url` field and mapping it from the trigger node's `webViewLink` property.
    ```json
    {
      "documentContent": "{{ $binary.data }}",
      "url": "{{ $('Google Drive Trigger').item.json.webViewLink }}"
    }
    ```
8.  **Activate your workflow!** Now, every new document in that folder will be automatically processed and added to your NewsFlash AI.

---

## Part 2: Automating Ingestion from Mattermost

This section describes how to capture important conversations from Mattermost channels and add them to NewsFlash AI.

### **Strategy: Use a Mattermost Bot and a Background Service**

The most robust method is to create a Mattermost Bot that runs as a background service (e.g., as a separate Node.js script or even another n8n workflow) and periodically polls for new messages.

### **Goal**

- Periodically read all new messages from specific Mattermost channels and ingest them into NewsFlash AI.

### **Prerequisites**

1.  **Admin Access to Mattermost**: To create a Bot Account.
2.  **A Service to Run the Polling Logic**: This could be a scheduled script on a server, a serverless function (e.g., Google Cloud Function), or an n8n workflow running on a schedule.

### **Step-by-Step Implementation Guide**

#### **Step 1: Create a Mattermost Bot Account**

1.  In Mattermost, go to **Integrations > Bot Accounts**.
2.  Click **"Add Bot Account"**.
3.  Give your bot a name (e.g., `NewsFlash-Ingestor`) and a description.
4.  After creation, Mattermost will provide you with an **Access Token**. **Save this token immediately**; it's your bot's API key.

#### **Step 2: Add the Bot to Your Target Channels**

Your bot can only read channels it's a member of. Go to each Mattermost channel you want to monitor and use the `/invite @bot-name` command to add your bot.

#### **Step 3: Build the Polling Service (Conceptual Logic)**

Your service will execute the following logic on a schedule (e.g., every 30 minutes).

1.  **Fetch the Bot's Channels**:
    *   Make a `GET` request to the Mattermost API: `/api/v4/users/{user_id}/teams/{team_id}/channels`.
    *   The `{user_id}` is your bot's user ID.
    *   Include the header: `Authorization: Bearer <your_bot_access_token>`.
    *   This gives you a list of all channels the bot can access.

2.  **Fetch Posts for Each Channel**:
    *   For each `channel_id` from the previous step, make a `GET` request to: `/api/v4/channels/{channel_id}/posts`.
    *   **Crucially**, use the `since` parameter to only get messages created after your last check. The value should be a Unix timestamp (in milliseconds).
    *   Example: `/api/v4/channels/{channel_id}/posts?since=1672531200000`
    *   Store the `create_at` timestamp of the newest post from the response. The next time your script runs, use this timestamp as the new `since` value.

3.  **Process and Ingest Posts**:
    *   For each post retrieved, format its content as needed. You might want to prepend it with the user's name and the timestamp.
    *   Make a `POST` request to your NewsFlash AI's `/api/ingest` endpoint for each message (or batch them together).
    *   **Request Body**:
        ```json
        {
          "documentContent": "From Mattermost user John Doe at 2023-09-01: \n\n We need to finalize the Q4 marketing budget by EOD."
        }
        ```

This polling mechanism ensures you capture all relevant conversations and make them searchable and summarizable within your NewsFlash AI knowledge base.
