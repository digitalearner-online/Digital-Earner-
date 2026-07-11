
// 🔴 UPDATED MENU FUNCTIONS - BACKGROUND LOCK + OVERLAY NO-CLICK
function openMenuOnly() {
    document.getElementById('menu').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.classList.add('menu-open');
    
    // 🔴 SAVE CURRENT SCROLL POSITION
    document.body.style.top = `-${window.scrollY}px`;
}

function closeMenuOnly() {
    document.getElementById('menu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('menu-open');
    
    // 🔴 RESTORE SCROLL POSITION
    const scrollY = document.body.style.top;
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

// Popup Functions
function openPopupOnly() {
    document.getElementById('popupContainer').classList.add('active');
    document.getElementById('popupOverlay').classList.add('active');
    document.body.classList.add('no-scroll');
}

function closePopupOnly() {
    document.getElementById('popupContainer').classList.remove('active');
    document.getElementById('popupOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// Exit Function
function handleExit() {
    if (confirm("Are you sure you want to exit Digital Earner?")) {
        window.location.href = "../index.html";
    }
}

// Cards animation
const cards = document.querySelectorAll(".card");
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});
cards.forEach(card => observer.observe(card));