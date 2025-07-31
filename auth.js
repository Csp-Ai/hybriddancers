import { supabase } from './supabaseClient.js';

export let currentUserId = null;

function updateNav(user) {
  const loginLink = document.getElementById('accountLink');
  const logoutNav = document.getElementById('logoutNavItem');
  const welcomeMsg = document.getElementById('welcomeMsg');

  if (user) {
    currentUserId = user.id;
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

async function initAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  updateNav(session?.user || null);
  supabase.auth.onAuthStateChange((_event, session) => {
    updateNav(session?.user || null);
  });
}

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
  initAuth();

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = signupForm.signupEmail.value;
      const password = signupForm.signupPassword.value;
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else {
        window.location.href = 'dashboard.html';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = loginForm.loginEmail.value;
      const password = loginForm.loginPassword.value;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        window.location.href = 'dashboard.html';
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
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      });
    }
  });
});
