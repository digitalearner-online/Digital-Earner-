import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";
    
    let sessionUser = null
    let targetSuccess = 0
    let claimLocked = false
    let countdownInterval = null
    
    function animateNumber(element, target, duration = 1000) {
        if (!element) return
        element.innerText = '0'
        if (target === 0) return
        const increment = target / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                element.innerText = target
                clearInterval(timer)
            } else {
                element.innerText = Math.floor(current)
            }
        }, 16)
    }
    
    async function checkAuthSession() {
    const session = await getSession();
    
    if (!session) {
        window.location.replace("../index47.html");
        return null;
    }
    
    sessionUser = session.user;
    return session;
}
    
    function updateTaskProgressAndButton() {
        const progress = Math.min(targetSuccess, 20)
        const percent = (progress / 20) * 100
        document.getElementById('taskProgressCount').innerText = `${progress} / 20`
        document.getElementById('taskProgressFill').style.width = `${percent}%`
        
        const claimSection = document.getElementById('claimSection')
        if (!claimSection) return
        
        if (targetSuccess >= 20 && !claimLocked) {
            claimSection.innerHTML = '<button class="claim-reward-btn" id="claimBtn20">🎁 Claim Airpods Reward Now</button>'
            const claimBtn = document.getElementById('claimBtn20')
            if (claimBtn) claimBtn.onclick = openWhatsAppClaim
        } else if (targetSuccess >= 20 && claimLocked) {
            claimSection.innerHTML = '<button class="claim-reward-btn" disabled>⏳ Already Claimed (Wait 24h)</button>'
        } else {
            claimSection.innerHTML = `<button class="claim-reward-btn" disabled style="opacity:0.6;">🔒 Need ${20 - targetSuccess} more tasks</button>`
        }
    }
    
    function startCountdown(expiryTimestamp) {
        const section = document.getElementById('countdownSection')
        if (!section) return
        if (countdownInterval) clearInterval(countdownInterval)
        
        function updateCountdown() {
            const now = Date.now()
            const diff = expiryTimestamp - now
            if (diff <= 0) {
                clearInterval(countdownInterval)
                section.innerHTML = ''
                claimLocked = false
                localStorage.removeItem(`claim_lock_${sessionUser.id}`)
                updateTaskProgressAndButton()
                return
            }
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (3600000)) / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            section.innerHTML = `<div class="countdown-text">⏱️ Next claim available in: ${hours}h ${minutes}m ${seconds}s</div>`
        }
        updateCountdown()
        countdownInterval = setInterval(updateCountdown, 1000)
    }
    
    function openWhatsAppClaim() {
        if (claimLocked) {
            alert('You have already claimed this month. Please wait 24 hours.')
            return
        }
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const currentMonth = monthNames[new Date().getMonth()]
        const name = sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0]
        const email = sessionUser.email
        const mobile = sessionUser.user_metadata?.mobile || 'Not Provided'
        
        const message = `Hi Digital Earner,%0A%0A✅ I have successfully completed 20 tasks in ${currentMonth}.%0A%0A📋 My Details:%0A👤 Name: ${name}%0A📧 Email: ${email}%0A📱 Mobile: ${mobile}%0A📅 Month: ${currentMonth}%0A%0A🙏 Please verify and send my Airpods reward.`
        
        const whatsappUrl = `https://wa.me/918272848772?text=${message}`
        window.open(whatsappUrl, '_blank')
        
        const expiry = Date.now() + (24 * 60 * 60 * 1000)
        const lockKey = `claim_lock_${sessionUser.id}`
        localStorage.setItem(lockKey, JSON.stringify({ expiry, month: currentMonth }))
        claimLocked = true
        startCountdown(expiry)
        updateTaskProgressAndButton()
    }
    
    async function loadDashboard() {
        if (!sessionUser) return
        document.getElementById('uName').textContent = sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0]
        document.getElementById('uEmail').textContent = sessionUser.email
        
        // ===== DP FIX: getPublicUrl method =====
        const { data: publicUrlData } = supabase.storage.from('profile-images').getPublicUrl(`${sessionUser.id}/profile.jpg`)
        if (publicUrlData && publicUrlData.publicUrl) {
            const img = document.getElementById('userDp')
            const initial = document.getElementById('dpInitial')
            img.src = publicUrlData.publicUrl
            img.style.display = 'block'
            initial.style.display = 'none'
        }
        
        const { data: wallet } = await supabase
            .from('user_earnings')
            .select('*')
            .eq('user_id', sessionUser.id)
            .single()
        
        if (wallet) {
            document.getElementById('pCount').innerText = wallet.pending_count || 0
            document.getElementById('sCount').innerText = wallet.success_count || 0
            document.getElementById('rCount').innerText = wallet.rejected_count || 0
            
            targetSuccess = wallet.airpods_progress || 0
            
            updateTaskProgressAndButton()
            
            animateNumber(document.getElementById('earnToday'), wallet.today_earnings || 0)
            animateNumber(document.getElementById('earnWeek'), wallet.week_earnings || 0)
            animateNumber(document.getElementById('earnMonth'), wallet.month_earnings || 0)
            animateNumber(document.getElementById('earnTotal'), wallet.total_earnings || 0)
        }
        
        const lockKey = `claim_lock_${sessionUser.id}`
        const lockData = localStorage.getItem(lockKey)
        if (lockData) {
            const { expiry } = JSON.parse(lockData)
            if (expiry > Date.now()) {
                claimLocked = true
                startCountdown(expiry)
                updateTaskProgressAndButton()
            } else {
                localStorage.removeItem(lockKey)
                claimLocked = false
                updateTaskProgressAndButton()
            }
        }
    }
    
    async function init() {
        document.getElementById('loading').style.display = 'flex'
        const session = await checkAuthSession()
        if (session) await loadDashboard()
        document.getElementById('loading').style.display = 'none'
    }
    init()
    
    const menu = document.getElementById('menu'), overlay = document.getElementById('overlay'), menuBtn = document.getElementById('menuBtn'), closeMenuBtn = document.getElementById('closeMenuBtn')
    function openMenuOnly() { menu.classList.add('active'); overlay.classList.add('active'); document.body.classList.add('menu-open'); document.body.style.top = `-${window.scrollY}px` }
    function closeMenuOnly() { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.classList.remove('menu-open'); const scrollY = document.body.style.top; document.body.style.top = ''; window.scrollTo(0, parseInt(scrollY || '0') * -1) }
    if (menuBtn) menuBtn.addEventListener('click', openMenuOnly)
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenuOnly)
    const backBtn = document.getElementById('backToDashboard');
if (backBtn)
    backBtn.addEventListener('click', () => window.location.href = '../html/dashboard.html');