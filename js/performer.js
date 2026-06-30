import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";

async function checkAuthSession() {
    const session = await getSession();
    
    if (!session) {
        window.location.replace("../index47.html");
        return null;
    }
    
    return session;
}
document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.touches && e.touches.length === 2) {
            e.preventDefault();
        }
    }, { passive: false });

    function lockFlipCards(lock) {
        let cards = document.querySelectorAll('.flip-card');
        cards.forEach(card => {
            if (lock) {
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.8';
            } else {
                card.style.pointerEvents = 'auto';
                card.style.opacity = '1';
            }
        });
    }

    function openMenuOnly() {
        document.getElementById('menu').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.body.classList.add('menu-open');
        document.body.style.top = `-${window.scrollY}px`;
        lockFlipCards(true);
    }

    function closeMenuOnly() {
        document.getElementById('menu').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        document.body.classList.remove('menu-open');
        const scrollY = document.body.style.top;
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        lockFlipCards(false);
    }

    function goToDashboard() {
        window.location.href = "dashboard.html";
    }

    const performersData = [
    { name: "Rahul Sharma", image: "../images/rahul.jpg" },
    { name: "Amit Kumar", image: "../images/amit.jpg" },
    { name: "Vikram Singh", image: "../images/vikram.jpg" },
    { name: "Rajesh Mehta", image: "../images/rajesh.jpg" },
    { name: "Arjun Yadav", image: "../images/arjun.jpg" },
    { name: "Rohan Das", image: "../images/rohan.jpg" },
    { name: "Priya Patel", image: "../images/priya.jpg" },
    { name: "Sneha Reddy", image: "../images/sneha.jpg" },
    { name: "Neha Gupta", image: "../images/neha.jpg" },
    { name: "Ananya Roy", image: "../images/ananya.jpg" }
];

    function generateDailyPerformers() {
        const today = new Date().toDateString();
        let seed = 0;
        for (let i = 0; i < today.length; i++) {
            seed += today.charCodeAt(i);
        }
        
        let shuffled = [...performersData];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = (seed + i) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        let performers = [];
        for (let i = 0; i < 10; i++) {
            let amount;
            if (i === 0) amount = 2500 + Math.floor(Math.random() * 150);
            else if (i === 1) amount = 2300 + Math.floor(Math.random() * 200);
            else if (i === 2) amount = 2100 + Math.floor(Math.random() * 200);
            else {
                amount = 1800 + Math.floor(Math.random() * 300) - (i * 20);
                if (amount < 500) amount = 800 + Math.floor(Math.random() * 300);
            }
            
            performers.push({
                name: shuffled[i].name,
                image: shuffled[i].image,
                amount: amount
            });
        }
        
        performers.sort((a, b) => b.amount - a.amount);
        return performers;
    }

    function formatAmount(amount) {
        return amount.toLocaleString('en-IN');
    }

    function updateDisplay() {
        const performers = generateDailyPerformers();
        
        for (let i = 0; i < 3; i++) {
            let p = performers[i];
            document.getElementById("name" + (i+1)).innerText = p.name;
            document.getElementById("back" + (i+1)).innerText = p.name;
            document.getElementById("front" + (i+1)).innerText = "₹" + formatAmount(p.amount);
            
            let img = document.querySelector(`#card${i+1} .profile img`);
            img.src = p.image;
            img.alt = p.name;
            document.getElementById("money" + (i+1)).innerText = formatAmount(p.amount);
        }
        
        let html = "";
        performers.forEach(p => {
            html += "<li>" + p.name + " - ₹" + formatAmount(p.amount) + "</li>";
        });
        document.getElementById("top10").innerHTML = html;
        localStorage.setItem('lastUpdate', new Date().toDateString());
    }

    function checkForNewDay() {
        const lastUpdate = localStorage.getItem('lastUpdate');
        const today = new Date().toDateString();
        if (lastUpdate !== today) updateDisplay();
    }

    updateDisplay();
    setInterval(checkForNewDay, 60000);

    function counter(id, target) {
        let el = document.getElementById(id);
        let count = 0;
        let interval = setInterval(function() {
            count += Math.ceil(target / 100);
            if (count >= target) {
                count = target;
                clearInterval(interval);
            }
            el.innerText = formatAmount(count);
        }, 20);
    }

    function confetti() {
        for (let i = 0; i < 40; i++) {
            let c = document.createElement("div");
            c.className = "confetti";
            c.style.left = Math.random() * 100 + "vw";
            c.style.background = "hsl(" + Math.random() * 360 + ",80%,60%)";
            c.style.animationDuration = (Math.random() * 3 + 2) + "s";
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }
    }

    function flip(card, id) {
        card.classList.toggle("flip");
        let amountText = document.getElementById("front" + id.slice(-1)).innerText.replace("₹", "");
        let amount = parseInt(amountText.replace(/,/g, ''));
        if (card.classList.contains("flip")) {
            counter(id, amount);
            confetti();
        }
    }

    const popupNames = [
        "Rahul from Delhi", "Aman from Jaipur", "Priya from Mumbai", 
        "Arif from Hyderabad", "Neha from Lucknow", "Vikram from Bangalore"
    ];

    function popup() {
        let name = popupNames[Math.floor(Math.random() * popupNames.length)];
        let amt = Math.floor(Math.random() * 300) + 200;
        let p = document.createElement("div");
        p.className = "popup";
        p.innerText = "👤 " + name + " earned ₹" + amt + " today";
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 6000);
    }

    setInterval(popup, 7000);

async function init() {
    const session = await checkAuthSession();
    if (!session) return;
}

init();

window.openMenuOnly = openMenuOnly;
window.closeMenuOnly = closeMenuOnly;
window.goToDashboard = goToDashboard;
window.flip = flip;