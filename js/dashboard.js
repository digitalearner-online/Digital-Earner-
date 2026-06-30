import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";

window.openMenuOnly = function () {
    document.getElementById('sideMenu').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.classList.add('menu-open');
}

window.closeMenuOnly = function () {
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('menu-open');
}

window.openPage = function(page) {
    window.location.href = page;
}

window.goPage = function(url) {
    if (url.includes("wa.me")) {
        window.open(url, "_blank");
    } else {
        window.location.href = url;
    }
}

window.showLogout = function() {
    document.getElementById("logoutPopup").style.display = "flex";
    closeMenuOnly();
    const yesBtn = document.querySelector('.yes-btn');
    if (yesBtn) {
        yesBtn.textContent = "Yes";
    }
}

window.closeLogout = function() {
    document.getElementById("logoutPopup").style.display = "none";
}
async function checkAuth() {
    const session = await getSession();
    if (!session) {
        window.location.replace("index47.html")
        return false
    }
    return true
}

async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;
    
    try {
        const name = user.user_metadata?.full_name
        const usernameElement = document.getElementById("username")
        if (usernameElement) {
            if (name) {
                usernameElement.textContent = name
            } else if (user.email) {
                usernameElement.textContent = user.email.split("@")[0]
            } else {
                usernameElement.textContent = "User"
            }
        }
    } catch (err) {
        console.error("Error loading user:", err)
        const usernameElement = document.getElementById("username")
        if (usernameElement) usernameElement.textContent = "User"
    }
}

window.confirmLogout = async function() {
    document.getElementById("logoutPopup").style.display = "none";
    
    const btn = document.querySelector('.yes-btn');
    if (btn) btn.textContent = 'Logging out...';
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
            if (btn) btn.textContent = "Yes";
            return;
        }
        
        localStorage.removeItem('hasAccount');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
        
        window.location.replace("index47.html");
        
    } catch (err) {
        console.error("Logout error:", err);
        alert("Error logging out. Please try again.");
        if (btn) btn.textContent = "Yes";
        window.location.href = "index47.html";
    }
}

async function init() {
    const isLoggedIn = await checkAuth();
    
    if (isLoggedIn) {
        await loadUser();
        document.body.style.display = "block";
    }
}

init();