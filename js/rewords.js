 import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    
    const supabaseUrl = "https://pxxbwzfxhapbzpznabbe.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4"
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    let completedTasks = 0
    
    const rewards = [
        { name: "Gaming Mouse", desc: "RGB, 6400 DPI, 6 Buttons", img: "mouse.jpg", required: 10 },
        { name: "Smart Watch", desc: "Heart Rate, Steps, Sleep Tracker", img: "watch.jpg", required: 12 },
        { name: "Wireless Headphones", desc: "Over-ear, Deep Bass, 30hr Battery", img: "headphone.jpg", required: 14 },
        { name: "Amazon Gift Card", desc: "₹500 Value • Shop Anything", img: "amazon.jpg", required: 5 },
        { name: "Flipkart Voucher", desc: "₹400 Off • Minimum Purchase", img: "flipkart.jpg", required: 6 },
        { name: "Bluetooth Speaker", desc: "Portable, 10W, LED Lights", img: "speaker.jpg", required: 8 },
        { name: "Power Bank", desc: "10000mAh, Fast Charging", img: "powerbank.jpg", required: 7 },
        { name: "TWS Earbuds", desc: "Bluetooth 5.3, 20hrs Battery", img: "earbuds.jpg", required: 9 }
    ]
    
    const offers = [
        { name: "Double Rewards", desc: "Get 2x value on next claim", icon: "🔥", required: 10 },
        { name: "Early Bird Bonus", desc: "Extra gift on first 5 tasks", icon: "⚡", required: 5 }
    ]
    
    async function protectPage() {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
            window.location.replace("login.html")
            return null
        }
        return data.session
    }
    
    async function loadCompletedTasks() {
        const session = await protectPage()
        if (!session) return 0
        const user = session.user
        
        // FIXED Data Sync: Changed structural target mapping from 'referrals' to real approved 'claim_requests' data model
        const { data: claims, error } = await supabase
            .from('claim_requests')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'approved')
        
        if (error) {
            console.error("Error loading approved tasks:", error)
            return 0
        }
        
        return claims?.length || 0
    }
    
    function getRemainingText(required) {
        const remaining = required - completedTasks
        if (remaining <= 0) {
            return "✅ Unlocked! You can claim this reward!"
        }
        return `📌 ${remaining} more tasks to unlock`
    }
    
    function showPopup(message) {
        const popup = document.getElementById('rewardPopup');
        const msgSpan = document.getElementById('popupMessage');
        if (msgSpan && popup) {
            msgSpan.textContent = message;
            popup.classList.add('show');
            setTimeout(() => { popup.classList.remove('show'); }, 3000);
        }
    }
    
    function handleClaim(rewardName, required) {
        const remaining = required - completedTasks
        if (remaining <= 0) {
            showPopup(`🎉 Congratulations! You have unlocked ${rewardName}! 🎉`);
        } else {
            showPopup(`🎯 Complete ${remaining} more tasks to unlock ${rewardName}!`);
        }
    }
    
    function renderRewards() {
        const productsGrid = document.getElementById('productsGrid')
        const offersGrid = document.getElementById('offersGrid')
        
        if(productsGrid) {
            productsGrid.innerHTML = rewards.map(reward => `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${reward.img}" alt="${reward.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
                    </div>
                    <div class="product-title">${reward.name}</div>
                    <div class="product-desc">${reward.desc}</div>
                    <div class="task-requirement">${getRemainingText(reward.required)}</div>
                    <button class="claim-btn" data-reward="${reward.name}" data-req="${reward.required}">Claim</button>
                </div>
            `).join('')
        }
        
        if(offersGrid) {
            offersGrid.innerHTML = offers.map(offer => `
                <div class="offer-card">
                    <div class="offer-icon">${offer.icon}</div>
                    <div class="offer-title">${offer.name}</div>
                    <div class="offer-desc">${offer.desc}</div>
                    <div class="offer-task">${getRemainingText(offer.required)}</div>
                    <button class="claim-offer-btn" data-reward="${offer.name}" data-req="${offer.required}">Claim</button>
                </div>
            `).join('')
        }
        
        const airpodsEl = document.getElementById('airpodsTask')
        if(airpodsEl) airpodsEl.textContent = getRemainingText(50)
        
        document.querySelectorAll('.claim-btn, .claim-offer-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.add('clicked');
                setTimeout(() => { this.classList.remove('clicked'); }, 300);
                
                const reward = this.getAttribute('data-reward');
                const required = parseInt(this.getAttribute('data-req'));
                handleClaim(reward, required);
            });
        });
    }
    
    async function init() {
        const grid = document.getElementById('productsGrid')
        if(grid) grid.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div> Loading rewards...</div>'
        
        completedTasks = await loadCompletedTasks()
        renderRewards()
    }
    
    function openMenuOnly() {
        document.getElementById('menu').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('menu-open');
        document.body.style.top = `-${window.scrollY}px`;
    }

    function closeMenuOnly() {
        document.getElementById('menu').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        document.body.classList.remove('menu-open');
        const scrollY = document.body.style.top;
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    function goToDashboard() {
        window.location.href = "dashboard.html";
    }
    
    const menuBtn = document.getElementById('menuBtn')
    const overlayBtn = document.getElementById('overlay')
    const backBtn = document.getElementById('backToDashboard')

    if(menuBtn) menuBtn.addEventListener('click', openMenuOnly)
    if(overlayBtn) overlayBtn.addEventListener('click', closeMenuOnly)
    if(backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = "dashboard.html";
        })
    }
    
    init()