// Technische authenticatielaag voor de AVG-hardening branch.
// Deze module kiest bewust nog GEEN loginprovider. Firebase Auth kan later
// e-mail/wachtwoord, Google, Microsoft/OIDC e.d. gebruiken zonder dat de
// datatoegangslogica opnieuw ontworpen hoeft te worden.

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function createAuthContext(firebaseApp) {
  const auth = getAuth(firebaseApp);

  function waitForUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user || null);
      });
    });
  }

  function requireUser() {
    return waitForUser().then((user) => {
      if (!user) {
        const error = new Error('AUTH_REQUIRED');
        error.code = 'auth/auth-required';
        throw error;
      }
      return user;
    });
  }

  return {
    auth,
    waitForUser,
    requireUser,
    logout: () => signOut(auth)
  };
}
