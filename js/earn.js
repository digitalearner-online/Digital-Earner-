
    import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";
    
    let currentUser = null
    let userName = "User"
    
    async function protectPage() {
    const session = await getSession();
    
    if (!session) {
        window.location.replace("../index47.html");
        return null;
    }
    
    return session;
}
    
    async function loadUserName() {
        const session = await protectPage()
        if (session) {
            const user = session.user
            currentUser = user
            const name = user.user_metadata?.full_name
            if (name) {
                userName = name
            } else {
                userName = user.email.split("@")[0]
            }
        }
    }
    
    function generateShareText(cleanLink) {
        return `${userName} has invited you to join *Digital Earner*🔥✨\n\n` +
               `🚀 Start your earning journey today with zero investment.\n\n` +
               `✅ Complete Your Process And Join *Digital Earner*\n\n` +
               `👉 Join here: ${cleanLink}\n\n` +
               `✨ Limited seats available. Register now!\n\n` +
               `Founder & CEO \n*SHADMAN RAO*`
    }
    
    async function shareLink(cleanLink) {
        
        const shareText = generateShareText(cleanLink)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Digital Earner - Invitation",
                    text: shareText
                })
            } catch (err) {
                if (err.name !== 'AbortError') {
                    prompt("Copy this text to share:", shareText)
                }
            }
        } else {
            prompt("Copy this text to share:", shareText)
        }
    }
    
    document.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation()
            await loadUserName()
            const cleanLink = this.getAttribute('data-link')
            shareLink(cleanLink)
        })
    })
    
    const userNames = [
        "Rahul", "Amit", "Vikram", "Priya", "Neha", "Arjun", "Sneha", "Rohan", "Anjali", "Kunal",
        "Divya", "Manish", "Pooja", "Raj", "Simran", "Tarun", "Meera", "Saurabh", "Kavya", "Yash",
        "Ishita", "Ankit", "Ritu", "Mohit", "Shreya", "Varun", "Tanvi", "Abhishek", "Sakshi", "Gaurav"
    ]
    
    const apps = ["Angel One", "Upstox", "5Paisa", "m.Stock"]
    
    function getRandomNotification() {
        const name = userNames[Math.floor(Math.random() * userNames.length)]
        const app = apps[Math.floor(Math.random() * apps.length)]
        let amount
        if (app === "Angel One") amount = Math.floor(Math.random() * (300 - 200 + 1)) + 200
        else if (app === "Upstox") amount = Math.floor(Math.random() * (250 - 200 + 1)) + 200
        else if (app === "5Paisa") amount = Math.floor(Math.random() * (250 - 200 + 1)) + 200
        else amount = Math.floor(Math.random() * (250 - 200 + 1)) + 200
        
        const messages = [
            `🎉 ${name} completed ${app} & earned ₹${amount}`,
            `🔥 ${name} just finished ${app} task & got ₹${amount}`,
            `💪 ${name} earned ₹${amount} by completing ${app}`,
            `✨ ${name} referral completed! ₹${amount} credited for ${app}`,
            `🚀 ${name} successfully completed ${app} & received ₹${amount}`,
            `💰 ${name} added ₹${amount} to wallet from ${app} referral`
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }
    
    function updateNotification() {
        const notificationText = getRandomNotification()
        const notificationEl = document.getElementById('notificationText')
        if (notificationEl) {
            notificationEl.textContent = notificationText
        }
        const interval = Math.floor(Math.random() * (25000 - 18000 + 1)) + 18000
        setTimeout(updateNotification, interval)
    }
    const menu = document.getElementById('menu')
    const overlay = document.getElementById('overlay')
    const menuBtn = document.getElementById('menuBtn')
    const closeMenuBtn = document.getElementById('closeMenuBtn')
    
    function openMenuOnly() {
        menu.classList.add('active')
        overlay.classList.add('active')
        document.body.classList.add('menu-open')
        document.body.style.top = `-${window.scrollY}px`
    }
    
    function closeMenuOnly() {
        menu.classList.remove('active')
        overlay.classList.remove('active')
        document.body.classList.remove('menu-open')
        const scrollY = document.body.style.top
        document.body.style.top = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', openMenuOnly)
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenuOnly)
    }
    
    const backBtn = document.getElementById('backToDashboard')
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html'
        })
    }
    if (overlay) {
    overlay.addEventListener("click", closeMenuOnly);
}
async function init() {
    const session = await protectPage();
    if (!session) return;
    
    await loadUserName();
}

init();