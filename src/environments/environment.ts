// Baseline environment template
// Build process runs scripts/set-env.mjs to inject configuration from .env or CI/CD environment variables.
export const environment = {
  production: false,
  appVersion: '1.0.0',
  googleClientId: '',
  authorizedEmail: '',
  driveAppFolderName: 'REMINDER_APP',
  driveScopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
