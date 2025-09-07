
# NewsFlash AI

NewsFlash AI is an AI-powered knowledge hub designed to streamline the newsletter creation process for teams like the Marketing Circle. It centralizes information from various sources, uses generative AI to summarize content, and provides powerful search and Q&A capabilities to help you find newsworthy updates quickly.

## Vision & Purpose

- **Centralize Information**: Collect and store updates from across the organization in one place.
- **Identify Newsworthy Content**: Help teams quickly find relevant updates for newsletters.
- **Effortless Summarization**: Automatically generate concise summaries from long documents, meeting transcripts, and notes.
- **Reduce Manual Work**: Minimize the time spent chasing team members for updates.
- **Ensure Accuracy**: Provide accurate context and information through intelligent search.

## Features

### 1. Source Repository (Dashboard)

The main dashboard provides a centralized view of all your content sources. Each piece of content is represented as a "Source Card," showing its title, a summary, its category, and when it was added.

- **Search**: A powerful search bar allows you to filter sources by keyword, title, summary, or category.
- **Add Sources**: You can add content in two ways:
  - **Manual Entry**: Fill out a form with a title, the full content, a category, and an optional URL. You can use the built-in AI to generate a summary for your content.
  - **Document Upload**: Upload a file (`.pdf`, `.txt`, `.md`). The AI will automatically process the document to extract a relevant title, generate a detailed summary, and assign the most appropriate category.

### 2. AI-Powered Q&A

Ask questions in natural language about your entire content repository. This feature allows you to quickly find specific information without having to manually sift through documents.

- **How to Use**: Navigate to the **Q&A** page. Type a question like, "What were the biggest wins last quarter?" or "Were there any challenges related to Project Phoenix?" The AI will synthesize an answer based on all the sources it knows about.

### 3. Newsletter Generator

Compile a draft newsletter in minutes. This tool lets you select relevant sources from your repository and generates a formatted newsletter draft based on your selections.

- **How to Use**:
  1. Go to the **Newsletter** page.
  2. All available sources are listed. Select the checkboxes next to the items you want to include.
  3. Set a title for your newsletter.
  4. Click "Generate." The AI will create a draft, organized by category, which you can then review and copy to your clipboard.

### 4. Automated Ingestion via API (for `n8n`, `Zapier`, etc.)

To fully automate your information-gathering process, NewsFlash AI includes a secure API endpoint for programmatic ingestion. This is perfect for connecting to services like `n8n` or `Zapier` to automatically add content from sources like Google Drive.

- **Endpoint**: `POST /api/ingest`
- **Authentication**: `Authorization: Bearer <YOUR_API_KEY>`
- **Body**: A JSON object with the following structure:
  ```json
  {
    "documentContent": "The full text content of your document...",
    "url": "https://optional.link/to/source"
  }
  ```

#### How to Use the API

1.  **Set Your API Key**:
    - Create a `.env.local` file in the root of the project.
    - Add your secret API key to this file:
      ```
      INGEST_API_KEY=your_super_secret_api_key_here
      ```
    - You must restart the application for this change to take effect.

2.  **Configure Your Automation Tool (e.g., n8n)**:
    - **Trigger**: Set up a trigger, such as "New File in Google Drive Folder."
    - **Action 1**: Add a step to read the content of that new file.
    - **Action 2**: Add an "HTTP Request" node configured as follows:
      - **URL**: `[your_app_url]/api/ingest`
      - **Method**: `POST`
      - **Headers**: Add an `Authorization` header with the value `Bearer [your_super_secret_api_key_here]`.
      - **Body**: Send a JSON object containing the file's text content.

Now, whenever a new meeting note or document is saved to your designated folder, it will be automatically summarized and added to your NewsFlash AI repository.
