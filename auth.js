import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Firebase configuration - values provided in Firebase console
// Configuration values should come from environment variables to avoid
// hard-coding credentials in source control. When bundling this script,
// provide the values via your build tool or server.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Expose current user ID for other modules
export let currentUserId = null;

function updateNav(user) {
  const loginLink = document.getElementById('accountLink');
  const logoutNav = document.getElementById('logoutNavItem');
  const welcomeMsg = document.getElementById('welcomeMsg');

  if (user) {
    currentUserId = user.uid;
    if (loginLink) {
      loginLink.textContent = 'Dashboard';
      loginLink.href = 'dashboard.html';
    }
    if (logoutNav) logoutNav.style.display = 'block';
    if (welcomeMsg) {
      welcomeMsg.style.display = 'block';
      welcomeMsg.textContent = `Welcome, ${user.email}`;
    }
  } else {
    currentUserId = null;
    if (loginLink) {
      loginLink.textContent = 'Log In';
      loginLink.href = 'login.html';
    }
    if (logoutNav) logoutNav.style.display = 'none';
    if (welcomeMsg) welcomeMsg.style.display = 'none';
  }
}

onAuthStateChanged(auth, updateNav);

function handlePasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target.type === 'password') {
        target.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        target.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  handlePasswordToggles();

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = signupForm.signupEmail.value;
      const password = signupForm.signupPassword.value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = loginForm.loginEmail.value;
      const password = loginForm.loginPassword.value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const logoutButtons = [
    document.getElementById('logoutBtn'),
    document.getElementById('logoutNav')
  ];
  logoutButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = 'index.html';
      });
    }
  });
});
