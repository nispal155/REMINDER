export const environment = {
  production: false,
  appVersion: '1.0.0',
  googleClientId: '', // Configurable via Settings UI or build env
  authorizedEmail: '',  // If set, only this email will be allowed
  driveAppFolderName: 'REMINDER_APP',
  driveScopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  firebaseConfig: {
    apiKey: "AIzaSyDMwCXMEVjwVVLpt8cy7RxyIo8OF7JyWNQ",
    authDomain: "reminder-d369d.firebaseapp.com",
    projectId: "reminder-d369d",
    storageBucket: "reminder-d369d.firebasestorage.app",
    messagingSenderId: "600017252630",
    appId: "1:600017252630:web:d25782e5cddb4755936037",
    measurementId: "G-WQYP722RRD"
  }
};
