# Messenger Fanpage CRM (Compliant)

A professional CRM for managing Facebook Fanpage messages with strict adherence to Meta's Messenger Platform policies.

## Features

- **Meta Integration**: Official Messenger Platform integration for receiving and sending messages.
- **Real-time Inbox**: Chat with customers directly from the dashboard.
- **Compliance Engine**: Automatically filters recipients for broadcasts based on the 24-hour messaging window.
- **Campaign Manager**: Create and track broadcast campaigns with detailed logs.
- **CRM Capabilities**: Tag customers, add internal notes, and export PSID lists.
- **Template Manager**: Save and reuse common responses.
- **Role-Based Access**: Admin and Staff permissions via Firebase Auth and Firestore Rules.
- **Audit Logs**: Track all sensitive actions for security and accountability.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Axios.
- **Database & Auth**: Firebase (Firestore & Authentication).
- **Deployment**: Cloud Run (via AI Studio).

## Setup Instructions

### 1. Meta Developer Dashboard Configuration

1.  Go to [Meta for Developers](https://developers.facebook.com/).
2.  Create a new App (Type: Business).
3.  Add the **Messenger** product.
4.  **Configure Webhooks**:
    -   Callback URL: `https://<YOUR_APP_URL>/webhook`
    -   Verify Token: Set a custom string (must match `META_VERIFY_TOKEN` in `.env`).
    -   Subscribe to `messages` and `messaging_postbacks` events.
5.  **Generate Access Token**:
    -   Link your Facebook Page.
    -   Generate a **Page Access Token**.
6.  **App Secret**: Get your App Secret from Settings > Basic.

### 2. Environment Variables

Configure the following secrets in AI Studio:

- `META_APP_ID`: Your Meta App ID.
- `META_APP_SECRET`: Your Meta App Secret.
- `META_VERIFY_TOKEN`: The token you set in the Webhook configuration.
- `META_PAGE_ACCESS_TOKEN`: The generated Page Access Token.
- `META_PAGE_ID`: Your Facebook Page ID.

### 3. Local Development

1.  Install dependencies: `npm install`
2.  Start the dev server: `npm run dev`
3.  The app will be available at `http://localhost:3000`.

## Compliance Note

This application is designed to be **compliant** with Meta's policies:
- **Standard Messaging**: Only allowed within 24 hours of a user's last message.
- **Broadcasts**: The campaign engine automatically filters out users outside the 24-hour window to prevent policy violations and page blocks.

## Security Rules

The `firestore.rules` file ensures that:
- Only authenticated admins can manage Page settings and other admins.
- Staff can manage conversations and customers.
- All writes are validated against the schema defined in `firebase-blueprint.json`.

---
*Developed with Google AI Studio Build.*
