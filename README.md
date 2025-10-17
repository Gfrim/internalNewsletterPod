
# NewsFlash

NewsFlash is an AI-powered knowledge hub designed to streamline the newsletter creation process for teams like the Marketing Circle. It centralizes information from various sources into a **persistent Firestore database**, uses generative AI to summarize content, and provides powerful search and Q&A capabilities to help you find newsworthy updates quickly.

## Vision & Purpose

- **Centralize Information**: Collect and store updates from across the organization in one place using Firestore.
- **Identify Newsworthy Content**: Help teams quickly find relevant updates for newsletters.
- **Effortless Summarization**: Automatically generate concise summaries from long documents, meeting transcripts, and notes.
- **Reduce Manual Work**: Minimize the time spent chasing team members for updates.
- **Ensure Accuracy**: Provide accurate context and information through intelligent search.

## Features

### 1. Source Repository (Dashboard)

The main dashboard provides a centralized, real-time view of all your content sources stored in Firestore. Each piece of content is represented as a "Source Card," showing its title, a summary, its category, and when it was added.

- **Search**: A powerful search bar allows you to filter sources by keyword, title, summary, or category.
- **Add Sources**: You can add content in two ways:
  - **Manual Entry**: Fill out a form with a title, the full content, a category, and an optional URL. You can use the built-in AI to generate a summary for your content.
  - **Document Upload**: Upload a file (`.pdf`, `.txt`, `.md`). The AI will automatically process the document to extract a relevant title, generate a detailed summary, and assign the most appropriate category.
    - **Note on File Size**: To ensure reliable processing, please use files with extracted text content under **1 MB**. This is due to the document size limit in the Firestore database.
- **Data Persistence**: All sources are saved to a Firestore database, ensuring your data is persistent and shared across all users.

### 2. AI-Powered Q&A

Ask questions in natural language about your entire content repository. This feature allows you to quickly find specific information without having to manually sift through documents.

- **How to Use**: Navigate to the **Q&A** page. Type a question like, "What were the biggest wins last quarter?" or "Were there any challenges related to Project Phoenix?" The AI will synthesize an answer based on all the sources it knows about from Firestore.

### 3. Newsletter Generator

Compile a draft newsletter in minutes. This tool lets you select relevant sources from your repository and generates a formatted newsletter draft based on your selections.

- **How to Use**:
  1. Go to the **Newsletter** page.
  2. All available sources are listed from Firestore. Select the checkboxes next to the items you want to include.
  3. Set a title for your newsletter.
  4. Click "Generate." The AI will create a draft, organized by category, which you can then review and copy to your clipboard.

### 4. Automated Ingestion via API (for `n8n`, `Zapier`, etc.)

To fully automate your information-gathering process, NewsFlash includes a secure API endpoint for programmatic ingestion. This is perfect for connecting to services like `n8n` or `Zapier` to automatically add content from sources like Google Drive.

- **Endpoint**: `POST /api/ingest`
- **Authentication**: `Authorization: Bearer <YOUR_API_KEY>`
- **Body**: A JSON object with the following structure:
  ```json
  {
    "documentContent": "The full text content of your document...",
    "url": "https://optional.link/to/source"
  }
  ```

---

## Setup & Configuration

To run this application, you need to configure a Firebase project and your Gemini API key.

### 1. Environment Variables

You need to provide API keys for the AI features and the secure ingestion endpoint.

1.  **Create a `.env.local` file** in the root of the project.
2.  **Add your keys** to this file, using `.env.example` as a template. You will need:
    *   `GEMINI_API_KEY`: Your API key for Google Gemini, which powers all generative AI features. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   `INGEST_API_KEY`: A secret key you create for securing the `/api/ingest` endpoint.
    ```
    GEMINI_API_KEY="your_gemini_api_key_here"
    INGEST_API_KEY="your_super_secret_api_key_here"
    ```
3.  You must restart the application for these changes to take effect.

### 2. Firebase Project Setup

This application requires a Firebase project to store and manage data using Firestore.

1.  **Create or Select a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project or select an existing one.
2.  **Get Your Firebase Config**:
    *   In your project, go to **Project settings** (click the gear icon ⚙️).
    *   In the **"Your apps"** section, click **"Add app"** and select the web icon (`</>`).
    *   Follow the setup steps, and when you see the `firebaseConfig` object, copy it.
3.  **Update the Application**:
    *   Paste your `firebaseConfig` object into `src/lib/firebase.ts`, replacing the placeholder configuration.

### 3. Firestore Database and Security Rules

You need to enable Firestore and set up security rules to allow the application to access your data.

1.  **Enable Firestore**: In the Firebase Console, go to **Build > Firestore Database** and click **"Create database"**. Start in **production mode**.
2.  **Set Collection Name**: The application uses a collection named `newsletterCollection`. Ensure your rules target this collection.
3.  **Update Security Rules**: Go to the **Rules** tab in the Firestore console and paste the following rules. These rules allow public read/write access for development. **You should secure these rules for production.**

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow public read/write access to the newsletterCollection for development.
        match /newsletterCollection/{docId=**} {
          allow read, write: if true;
        }
      }
    }
    ```
4.  **Publish** your rules.
