// Firebase Authentication helpers for Hybrid Dancers site
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

function updateAccountLink(user) {
    const link = document.getElementById('accountLink');
    if (!link) return;
    if (user) {
        link.innerHTML = '<i class="fas fa-user-circle"></i> My Account';
        link.href = 'dashboard.html';
    } else {
        link.textContent = 'Log In';
        link.href = 'login.html';
    }
}

auth.onAuthStateChanged(user => {
    updateAccountLink(user);
    const userName = document.getElementById('userName');
    const membership = document.getElementById('membershipStatus');
    if (user && userName) {
        userName.textContent = user.displayName || 'Dancer';
        if (membership) membership.textContent = 'Membership Status: Active';
    }
    if (!user && document.body.classList.contains('dashboard-page')) {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            auth.signInWithEmailAndPassword(email, password)
                .then(() => window.location.href = 'dashboard.html')
                .catch(err => alert(err.message));
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            auth.createUserWithEmailAndPassword(email, password)
                .then(res => res.user.updateProfile({ displayName: name }))
                .then(() => window.location.href = 'dashboard.html')
                .catch(err => alert(err.message));
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => window.location.href = 'index.html');
        });
    }

    const bookClassBtn = document.getElementById('bookClassBtn');
    if (bookClassBtn) {
        bookClassBtn.addEventListener('click', () => {
            window.location.href = 'booking.html';
        });
    }

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
});
