import { supabase } from "./supabase.auth.js";

function showError(id, message) {
  const error = document.getElementById(id);
  error.textContent = message;
  error.style.display = "block";
  
  setTimeout(() => {
    error.style.display = "none";
  }, 3000);
}

function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  
  toggle.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });
  
  toggle.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
  });
}

setupPasswordToggle("newPassword", "newPasswordToggle");
setupPasswordToggle("confirmPassword", "confirmPasswordToggle");

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
  if (newPassword.length < 6) {
    showError("newPasswordError", "Password must be at least 6 characters.");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match.");
    return;
  }
  
  document.getElementById("loading").style.display = "flex";
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  document.getElementById("loading").style.display = "none";
  
  if (error) {
    alert(error.message);
    return;
  }
  
  alert("Password updated successfully.");
  
  window.location.replace("../index47.html");
});