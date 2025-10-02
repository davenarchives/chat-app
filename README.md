# ChattRoom

ChattRoom is a real-time group chat experience built with React and Firebase. It features Google Authentication, Firestore-backed messaging, aggressive profanity filtering, and a companion Cloud Function that keeps the history tidy. The project is configured for Firebase Hosting and Functions so you can deploy a production-ready chat in minutes.

## Screenshots
<img width="1829" height="910" alt="image" src="https://github.com/user-attachments/assets/31cb70c7-ad7c-4777-80c8-510f28eff9cf" />
<img width="1830" height="920" alt="image" src="https://github.com/user-attachments/assets/76086b48-b0e6-4dda-80eb-b4deabbc5b10" />


## Features
- Google Sign-In via Firebase Authentication with graceful loading and error states
- Real-time Firestore listeners that stream the latest messages without manual refreshes
- Dual-layer profanity filtering (client utility and Cloud Function) that sanitizes text and tracks flagged users
- Message history automatically pruned to the most recent 25 entries to keep the room fast
- Accessible, responsive UI with avatar fallbacks, smooth autoscroll, and status messaging
- Tested authentication flow with React Testing Library mocks for Firebase services

## Tech Stack
- React 19 (Create React App tooling)
- Firebase Web SDK (Authentication, Firestore)
- Firebase Cloud Functions (Node.js 22 runtime)
- Firebase Hosting plus Firestore security rules
- bad-words profanity filter shared between client and functions
- Jest plus React Testing Library for unit and integration tests

## Project Structure
```
chat-app/
|-- public/                     # Static assets served by CRA and Firebase Hosting
|-- src/
|   |-- components/             # ChatRoom, SendMessage, ChatMessage, SignIn UI logic
|   |-- utils/                  # Shared helpers (profanity filter wrapper)
|   |-- App.js / App.css        # App shell, authentication state handling, layout styles
|   `-- firebase.js             # Firebase client initialization
|-- functions/                  # Firebase Cloud Functions codebase
|   |-- index.js                # detectEvilUsers trigger for profanity and pruning
|   `-- package.json            # Node 22 runtime, lint and deploy scripts
|-- firestore.rules             # Security rules guarding the messages collection
|-- firebase.json               # Hosting and Functions deployment config
`-- README.md                   # Project documentation (this file)
```

## Prerequisites
- Node.js 18 or newer installed locally (Functions deploy targets Node 22 and requires npm 8 or newer)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore and Authentication enabled
- Google sign-in provider enabled in the Firebase Console

## Firebase Setup
1. Create or select a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore in production or test mode as desired.
3. Enable Authentication -> Sign-in method -> Google.
4. In the project settings, create a Web App and copy the SDK configuration.
5. Update `src/firebase.js` with your project's configuration block. The current values point to `chat-app-80356` and should be replaced for other environments.
6. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
7. (Optional) Deploy the empty Firestore indexes (`firestore.indexes.json`) or manage them via the console if you add composite indexes later.

## Local Development
```bash
# Install React app dependencies
npm install

# Install Cloud Functions dependencies
npm install --prefix functions

# Start the React development server (http://localhost:3000)
npm start
```

The app automatically connects to your configured Firebase project. When testing changes safely, consider the Firebase Emulator Suite:
```bash
# Serve Functions and Firestore emulators
firebase emulators:start --only functions,firestore
```
Update `src/firebase.js` to point at your emulator instances when running offline (see the Firebase SDK docs for `connectFirestoreEmulator` and `connectAuthEmulator`).

## Cloud Functions
- `functions/index.js` exports a single trigger, `detectEvilUsers`, that runs on every new document in `messages/{messageId}`.
- Responsibilities:
  - Clean profane text with `bad-words`
  - Flag messages that were sanitized and record offender stats in `flags/{uid}`
  - Trim history to the most recent 25 messages using a batch delete
  - Log pruning outcomes for observability
- Lint locally with `npm run lint --prefix functions` before deploying.
- Deploy only the function code with:
  ```bash
  firebase deploy --only functions
  ```

## Firestore Data Model
- `messages` collection documents:
  - `text` (string, required)
  - `uid` (string, Firebase Authentication user id)
  - `displayName`, `photoURL`, `email` (optional metadata used for the UI)
  - `createdAt` (Firestore timestamp, set client-side via `serverTimestamp`)
  - `flagged` (boolean, added when profanity cleanup occurs)
  - `cleanedAt` (timestamp, Functions adds when sanitizing text)
- `flags` collection documents (written by Cloud Function):
  - `count` (number of times the user was flagged)
  - `lastFlaggedMessageId`
  - `updatedAt`

Security rules (`firestore.rules`) ensure only authenticated users can read messages, and they can only write new messages that belong to them with a server-side timestamp. Updates and deletes are disallowed from clients, so moderation relies on the Cloud Function.

## Testing
```bash
npm test
```
The test suite (`src/App.test.js`) mocks Firebase services to assert the authentication state transitions. Add component or integration tests alongside existing files within `src/`.

## Building and Deployment
```bash
# Production build for hosting
npm run build

# Deploy hosting and functions (after logging in with firebase login)
firebase deploy
```
`firebase.json` is preconfigured to serve the React build from `build/` and rewrite all routes to `index.html` for client-side routing. Update the hosting `site` value if you bind the project to a different Firebase Hosting target.

## Troubleshooting
- **Authentication spinner never resolves**: verify that `onAuthStateChanged` is firing by checking the browser console. Ensure the Firebase config matches the project and the domain is whitelisted in the Firebase console.
- **Messages missing or not updating**: confirm Firestore rules were deployed and that the authenticated user has permission to create documents.
- **Profanity remains**: install dependencies in both the root and `functions/` directories and deploy the Cloud Function to apply server-side cleanup.
- **Function deploy fails**: check you are using Node.js 18 or newer locally and that the Firebase CLI is updated. Run `npm run lint --prefix functions` for detailed ESLint feedback.

Happy chatting!
