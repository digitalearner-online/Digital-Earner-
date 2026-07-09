import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";

let sessionUser = null;

const rewardsData = [
    { tasks: 10, reward: "₹50 UPI Cashback", icon: "💳" },
    { tasks: 20, reward: "₹100 Amazon Gift Card", icon: "🎁" },
    { tasks: 30, reward: "₹150 UPI Cashback", icon: "💳" },
    { tasks: 40, reward: "₹200 Amazon Gift Card", icon: "🎁" },
    { tasks: 50, reward: "Bluetooth Speaker", icon: "🔊" },
    { tasks: 60, reward: "₹400 Amazon Gift Card", icon: "🎁" },
    { tasks: 70, reward: "TWS Earbuds", icon: "🎧" },
    { tasks: 80, reward: "₹600 Amazon Gift Card", icon: "🎁" },
    { tasks: 90, reward: "₹700–₹800 Premium Voucher", icon: "💳" },
    { tasks: 100, reward: "Smart Watch", icon: "⌚" },
];

function showToast(msg, type = "success") {
    const toast = document.getElementById("toastMessage");
    toast.textContent = msg;
    toast.className = `toast-message ${type}`;
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 3000);
}

async function protectPage() {
    const session = await getSession();
    
    if (!session) {
        window.location.replace("../index.html");
        return null;
    }
    
    sessionUser = session.user;
    return session;
}

async function getClaimedRewards() {
    const month = new Date().toISOString().slice(0, 7);
    const { data } = await supabase
        .from("reward_claims")
        .select("tasks_completed")
        .eq("user_id", sessionUser.id)
        .eq("month", month)
        .eq("status", "pending");
    return data ? data.map((r) => r.tasks_completed) : [];
}

async function renderRewards() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: claims } = await supabase
        .from("claim_requests")
        .select("id")
        .eq("user_id", sessionUser.id)
        .eq("status", "approved")
        .gte("created_at", startOfMonth.toISOString());
    
    const taskCount = claims ? claims.length : 0;
    const capped = Math.min(taskCount, 100);
    
    document.getElementById("progressCount").innerText = `${capped} / 100`;
    document.getElementById("progressFill").style.width = `${(capped / 100) * 100}%`;
    
    const claimedList = await getClaimedRewards();
    
    const grid = document.getElementById("rewardGrid");
    let html = "";
    rewardsData.forEach((item) => {
        const isUnlocked = capped >= item.tasks;
        const isClaimed = claimedList.includes(item.tasks);
        
        let statusClass = "locked";
        let badgeText = "🔒 Locked";
        let badgeClass = "locked";
        let btnDisabled = true;
        let btnText = "🔒 Locked";
        
        if (isClaimed) {
            statusClass = "claimed";
            badgeText = "⏳ Pending";
            badgeClass = "claimed";
            btnDisabled = true;
            btnText = "⏳ Pending";
        } else if (isUnlocked) {
            statusClass = "unlocked";
            badgeText = "✅ Unlocked";
            badgeClass = "unlocked";
            btnDisabled = false;
            btnText = "🎁 Claim";
        }
        
        html += `
            <div class="reward-item ${statusClass}">
                <span class="badge ${badgeClass}">${badgeText}</span>
                <span class="icon">${item.icon}</span>
                <div class="tasks">${item.tasks} <span>tasks</span></div>
                <div class="reward">${item.reward}</div>
                <button class="claim-btn" ${btnDisabled ? "disabled" : ""} 
                    onclick="claimReward(${item.tasks}, '${item.reward}')">
                    ${btnText}
                </button>
            </div>
        `;
    });
    grid.innerHTML = html;
}

window.claimReward = async function(tasks, reward) {
    if (!sessionUser) return;
    
    const month = new Date().toISOString().slice(0, 7);
    
    const { data: existing } = await supabase
        .from("reward_claims")
        .select("id")
        .eq("user_id", sessionUser.id)
        .eq("tasks_completed", tasks)
        .eq("month", month)
        .maybeSingle();
    
    if (existing) {
        showToast("Already claimed this reward", "error");
        return;
    }
    
    const { error } = await supabase.from("reward_claims").insert({
        user_id: sessionUser.id,
        tasks_completed: tasks,
        reward: reward,
        month: month,
        status: "pending",
    });
    
    if (error) {
        showToast("❌ " + error.message, "error");
    } else {
        showToast("✅ Reward claimed! Admin will verify.", "success");
        renderRewards();
    }
};

async function init() {
    document.getElementById("loading").style.display = "flex";
    const session = await protectPage();
    if (session) await renderRewards();
    document.getElementById("loading").style.display = "none";
}

init();

// ===== MENU FUNCTIONS (Performer style) =====
function openMenuOnly() {
    document.getElementById("menu").classList.add("active");
    document.getElementById("overlay").classList.add("active");
    document.body.classList.add("menu-open");
    document.body.style.top = `-${window.scrollY}px`;
}

function closeMenuOnly() {
    document.getElementById("menu").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    document.body.classList.remove("menu-open");
    const scrollY = document.body.style.top;
    document.body.style.top = "";
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
}

function goToDashboard() {
    window.location.href = "dashboard.html";
}

window.openMenuOnly = openMenuOnly;
window.closeMenuOnly = closeMenuOnly;
window.goToDashboard = goToDashboard;