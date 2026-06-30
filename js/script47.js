import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"

const supabaseUrl = "https://pxxbwzfxhapbzpznabbe.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4"
const supabase = createClient(supabaseUrl, supabaseKey)

const FIXED_SPONSOR_ID = "DGTENSHA73@"

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtnToggle = document.querySelector('.login-btn');
const realLoginBtn = document.getElementById('loginBtn'); 
const regBtn = document.getElementById('regBtn');


async function checkUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    window.location.replace("../html/dashboard.html")
  }
}
checkUser()

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId)
  const error = document.getElementById(errorId)
  input.classList.add("error")
  error.textContent = message
  error.style.display = "block"
  setTimeout(() => {
    input.classList.remove("error")
    error.style.display = "none"
  }, 3000)
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateName(name) {
  return /^[A-Za-z\s]+$/.test(name)
}

const loginEmail = document.getElementById("loginEmail")
const loginSuggestions = document.getElementById("loginSuggestions")

loginEmail.addEventListener('input', function() {
  const value = this.value.trim();
  loginSuggestions.innerHTML = '';
  if (value.length === 0) {
    loginSuggestions.style.display = 'none';
    return;
  }
  if (!validateEmail(value) && value.length > 0) {
    loginSuggestions.style.display = 'block';
    const suggestion = document.createElement('div');
    suggestion.className = 'suggestion-item';
    suggestion.innerHTML = `💡 Did you mean: <strong>${value}@gmail.com</strong>?`;
    suggestion.addEventListener('click', function() {
      loginEmail.value = value + '@gmail.com';
      loginSuggestions.style.display = 'none';
      const event = new Event('input');
      loginEmail.dispatchEvent(event);
    });
    loginSuggestions.appendChild(suggestion);
    const suggestion2 = document.createElement('div');
    suggestion2.className = 'suggestion-item';
    suggestion2.innerHTML = `💡 Did you mean: <strong>${value}@yahoo.com</strong>?`;
    suggestion2.addEventListener('click', function() {
      loginEmail.value = value + '@yahoo.com';
      loginSuggestions.style.display = 'none';
      const event = new Event('input');
      loginEmail.dispatchEvent(event);
    });
    loginSuggestions.appendChild(suggestion2);
  } else {
    loginSuggestions.style.display = 'none';
  }
});

const regEmail = document.getElementById("regEmail")
const registerSuggestions = document.getElementById("registerSuggestions")

regEmail.addEventListener('input', function() {
  const value = this.value.trim();
  registerSuggestions.innerHTML = '';
  if (value.length === 0) {
    registerSuggestions.style.display = 'none';
    return;
  }
  if (!validateEmail(value) && value.length > 0) {
    registerSuggestions.style.display = 'block';
    const suggestion = document.createElement('div');
    suggestion.className = 'suggestion-item';
    suggestion.innerHTML = `💡 Did you mean: <strong>${value}@gmail.com</strong>?`;
    suggestion.addEventListener('click', function() {
      regEmail.value = value + '@gmail.com';
      registerSuggestions.style.display = 'none';
      const event = new Event('input');
      regEmail.dispatchEvent(event);
    });
    registerSuggestions.appendChild(suggestion);
    const suggestion2 = document.createElement('div');
    suggestion2.className = 'suggestion-item';
    suggestion2.innerHTML = `💡 Did you mean: <strong>${value}@yahoo.com</strong>?`;
    suggestion2.addEventListener('click', function() {
      regEmail.value = value + '@yahoo.com';
      registerSuggestions.style.display = 'none';
      const event = new Event('input');
      regEmail.dispatchEvent(event);
    });
    registerSuggestions.appendChild(suggestion2);
  } else {
    registerSuggestions.style.display = 'none';
  }
});

document.getElementById("forgotPassword").addEventListener("click", (e) => {
  e.preventDefault()
  window.location.href = "reset-password.html"
})

registerBtn.addEventListener('click', () => {
  container.classList.add('active');
})
loginBtnToggle.addEventListener('click', () => {
  container.classList.remove('active');
})

realLoginBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPassInput = document.getElementById('loginPass');
  if (!loginEmailInput.checkValidity()) {
    loginEmailInput.reportValidity();
    return;
  }
  if (!loginPassInput.checkValidity()) {
    loginPassInput.reportValidity();
    return;
  }
  if (realLoginBtn.disabled) return;
  realLoginBtn.disabled = true;
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  try {
    document.getElementById("loading").style.display = "flex";
    if (!email) {
      showError('loginEmail', 'loginEmailError', 'Email is required');
      return;
    }
    if (!validateEmail(email)) {
      showError('loginEmail', 'loginEmailError', 'Invalid email format');
      return;
    }
    if (password.length < 6) {
      showError('loginPass', 'loginPassError', 'Password must be at least 6 characters');
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) throw error;
    if (data.session) {
      window.location.replace("dashboard.html");
    }
  } catch (error) {
    showError('loginEmail', 'loginEmailError', error.message || 'Login failed. Please try again.');
  } finally {
    document.getElementById("loading").style.display = "none";
    realLoginBtn.disabled = false;
  }
});

document.getElementById('regBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const regUserInput = document.getElementById('regUser');
  const regEmailInput = document.getElementById('regEmail');
  const regPassInput = document.getElementById('regPass');
  const regConfirmPassInput = document.getElementById('regConfirmPass');
  const regSponsorInput = document.getElementById('regSponsor');
  if (!regUserInput.checkValidity()) {
    regUserInput.reportValidity();
    return;
  }
  if (!regEmailInput.checkValidity()) {
    regEmailInput.reportValidity();
    return;
  }
  if (!regPassInput.checkValidity()) {
    regPassInput.reportValidity();
    return;
  }
  if (!regConfirmPassInput.checkValidity()) {
    regConfirmPassInput.reportValidity();
    return;
  }
  if (!regSponsorInput.checkValidity()) {
    regSponsorInput.reportValidity();
    return;
  }
  if (regBtn.disabled) return;
  regBtn.disabled = true;
  const full_name = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const confirmPassword = document.getElementById('regConfirmPass').value;
  const regSponsor = document.getElementById('regSponsor').value.trim();
  try {
    document.getElementById("loading").style.display = "flex";
    if (!validateName(full_name)) {
      showError('regUser', 'regUserError', 'Please enter a valid name (letters only)');
      return;
    }
    if (!email) {
      showError('regEmail', 'regEmailError', 'Email is required');
      return;
    }
    if (!validateEmail(email)) {
      showError('regEmail', 'regEmailError', 'Invalid email format');
      return;
    }
    if (password.length < 6) {
      showError('regPass', 'regPassError', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showError('regConfirmPass', 'regConfirmPassError', 'Passwords do not match');
      return;
    }
    if (regSponsor !== FIXED_SPONSOR_ID) {
      showError('regSponsor', 'regSponsorError', 'Invalid Sponsor ID');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: full_name,
          sponsor_id: regSponsor
        }
      }
    });
    if (error) throw error;
    if (data.user) {
      window.location.replace("dashboard.html");
    }
  } catch (error) {
    showError('regEmail', 'regEmailError', error.message || 'Registration failed. Please try again.');
  } finally {
    document.getElementById("loading").style.display = "none";
    regBtn.disabled = false;
  }
});

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const loginForm = document.querySelector('.form-box.login');
    const registerForm = document.querySelector('.form-box.register');
    if (loginForm.contains(e.target)) {
      realLoginBtn.click();
    } else if (registerForm.contains(e.target)) {
      document.getElementById('regBtn').click();
    }
  }
});

function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  toggle.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    input.type = input.type === "password" ? "text" : "password";
  });
}
setupPasswordToggle("loginPass", "loginPassToggle");
setupPasswordToggle("regPass", "regPassToggle");
setupPasswordToggle("regConfirmPass", "regConfirmPassToggle");