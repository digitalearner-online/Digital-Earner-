import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    
    const supabase = createClient(
        "https://pxxbwzfxhapbzpznabbe.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4"
    )
    
    let currentAdminId = null
    
    function showToast(message, type) {
        const toast = document.getElementById('toastMessage')
        toast.textContent = message
        toast.className = `toast-message ${type}`
        toast.style.display = 'block'
        setTimeout(() => toast.style.display = 'none', 3000)
    }
    
    const emailInput = document.getElementById('adminEmail')
    const suggestionsBox = document.getElementById('emailSuggestions')
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com']
    
    if (emailInput && suggestionsBox) {
        emailInput.addEventListener('input', function() {
            const value = this.value
            const atIndex = value.indexOf('@')
            
            if (atIndex !== -1) {
                const localPart = value.substring(0, atIndex)
                const domainPart = value.substring(atIndex + 1)
                
                if (domainPart.length === 0) {
                    suggestionsBox.innerHTML = ''
                    domains.forEach(domain => {
                        const div = document.createElement('div')
                        div.className = 'suggestion-item'
                        div.textContent = localPart + '@' + domain
                        div.onclick = () => {
                            emailInput.value = localPart + '@' + domain
                            suggestionsBox.classList.remove('show')
                        }
                        suggestionsBox.appendChild(div)
                    })
                    suggestionsBox.classList.add('show')
                } else {
                    const matchedDomains = domains.filter(d => d.startsWith(domainPart))
                    if (matchedDomains.length > 0) {
                        suggestionsBox.innerHTML = ''
                        matchedDomains.forEach(domain => {
                            const div = document.createElement('div')
                            div.className = 'suggestion-item'
                            div.textContent = localPart + '@' + domain
                            div.onclick = () => {
                                emailInput.value = localPart + '@' + domain
                                suggestionsBox.classList.remove('show')
                            }
                            suggestionsBox.appendChild(div)
                        })
                        suggestionsBox.classList.add('show')
                    } else {
                        suggestionsBox.classList.remove('show')
                    }
                }
            } else {
                suggestionsBox.classList.remove('show')
            }
        })
    }
    
    document.addEventListener('click', function(e) {
        if (emailInput && suggestionsBox && !emailInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove('show')
        }
    })
    
    async function verifyAdminLogin() {
        const email = document.getElementById('adminEmail').value.trim()
        const password = document.getElementById('adminPassword').value
        const rememberMe = document.getElementById('rememberMe').checked
        const errorDiv = document.getElementById('loginError')
        const btn = document.getElementById('loginBtn')
        
        if (!email || !password) {
            errorDiv.innerText = 'Please enter email and password'
            return
        }
        
        errorDiv.innerText = ''
        btn.disabled = true
        btn.innerHTML = '<span class="spinner"></span> Verifying...'
        
        try {
            const { data: admin } = await supabase
                .from('admin_credentials')
                .select('email')
                .eq('email', email)
                .maybeSingle()
            
            if (!admin) {
                errorDiv.innerText = '❌ Invalid email or password'
                btn.disabled = false
                btn.innerHTML = 'Login →'
                return
            }
            
            const { data: verifyData } = await supabase.rpc('check_admin_password', {
                p_email: email,
                p_password: password
            })
            
            if (!verifyData) {
                errorDiv.innerText = '❌ Invalid email or password'
                btn.disabled = false
                btn.innerHTML = 'Login →'
                return
            }
            
            currentAdminId = 'c83107ce-1135-417d-a4c3-4d61c25369a1'
            
            if (rememberMe) {
                localStorage.setItem('admin_logged_in', 'true')
                localStorage.setItem('admin_email', email)
                localStorage.setItem('admin_expiry', Date.now() + 30 * 24 * 60 * 60 * 1000)
            } else {
                sessionStorage.setItem('admin_logged_in', 'true')
                sessionStorage.setItem('admin_email', email)
            }
            
            document.getElementById('loginOverlay').style.display = 'none'
            document.getElementById('adminPanel').style.display = 'block'
            init()
            
        } catch (err) {
            errorDiv.innerText = 'Something went wrong. Try again.'
            console.error(err)
            btn.disabled = false
            btn.innerHTML = 'Login →'
        }
    }
    
    document.getElementById('loginBtn').onclick = verifyAdminLogin
    
    function checkAutoLogin() {
        const local = localStorage.getItem('admin_logged_in')
        const expiry = localStorage.getItem('admin_expiry')
        
        if (local === 'true' && expiry && parseInt(expiry) > Date.now()) {
            currentAdminId = 'c83107ce-1135-417d-a4c3-4d61c25369a1'
            document.getElementById('loginOverlay').style.display = 'none'
            document.getElementById('adminPanel').style.display = 'block'
            init()
            return true
        }
        
        if (sessionStorage.getItem('admin_logged_in') === 'true') {
            currentAdminId = 'c83107ce-1135-417d-a4c3-4d61c25369a1'
            document.getElementById('loginOverlay').style.display = 'none'
            document.getElementById('adminPanel').style.display = 'block'
            init()
            return true
        }
        
        return false
    }
    
    window.logoutAdmin = function() {
        localStorage.clear()
        sessionStorage.clear()
        location.reload()
    }
    
    async function loadStats() {
        try {
            const { count: pendingCount } = await supabase
                .from('claim_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
            
            const { count: approvedCount } = await supabase
                .from('claim_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
            
            const { count: rejectedCount } = await supabase
                .from('claim_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'rejected')
            
            document.getElementById('pendingCount').innerHTML = pendingCount || 0
            document.getElementById('approvedCount').innerHTML = approvedCount || 0
            document.getElementById('rejectedCount').innerHTML = rejectedCount || 0
            
        } catch (err) {
            console.error("Stats error:", err)
        }
    }
    
    function escapeHtml(str) {
        if (!str) return '—'
        return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))
    }
    
    async function loadClaims() {
        const { data: claims } = await supabase
            .from('claim_requests')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
        
        const container = document.getElementById('claimsList')
        if (!claims || claims.length === 0) {
            container.innerHTML = '<div class="no-claims">✅ No pending claims</div>'
            return
        }
        
        let html = ''
        for (const claim of claims) {
            const date = new Date(claim.created_at).toLocaleString()
            html += `
                <div class="claim-item" id="claim-${claim.id}">
                    <div class="claim-header">
                        <span class="claim-id">#${claim.id}</span>
                        <span class="claim-date">📅 ${date}</span>
                        <span class="status-badge">⏳ PENDING</span>
                    </div>
                    
                    <div class="section-title claimant">👤 CLAIMANT DETAILS</div>
                    <div class="details-grid">
                        <div class="detail-item"><span class="detail-label">Full Name</span><span class="detail-value">${escapeHtml(claim.user_name)}</span></div>
                        <div class="detail-item"><span class="detail-label">Email Address</span><span class="detail-value">${escapeHtml(claim.user_email)}</span></div>
                        <div class="detail-item"><span class="detail-label">Mobile Number</span><span class="detail-value">${escapeHtml(claim.user_mobile)}</span></div>
                        <div class="detail-item"><span class="detail-label">Broker Name</span><span class="detail-value">${escapeHtml(claim.broker_name)}</span></div>
                    </div>
                    
                    <div class="section-title referred">🎯 REFERRED USER DETAILS</div>
                    <div class="details-grid">
                        <div class="detail-item"><span class="detail-label">Full Name</span><span class="detail-value">${escapeHtml(claim.referred_name) || '—'}</span></div>
                        <div class="detail-item"><span class="detail-label">Email Address</span><span class="detail-value">${escapeHtml(claim.referred_email) || '—'}</span></div>
                        <div class="detail-item"><span class="detail-label">Mobile Number</span><span class="detail-value">${escapeHtml(claim.referred_mobile) || '—'}</span></div>
                    </div>
                    
                    ${claim.proof_screenshot ? `<a href="${claim.proof_screenshot}" target="_blank" class="screenshot-link">📸 View Screenshot Proof</a>` : '<div style="margin-top:12px; color:#94a3b8;">📸 No screenshot uploaded</div>'}
                    
                    <div class="action-buttons">
                        <button class="approve-btn" onclick="approveClaim(
                            '${claim.id}', 
                            '${claim.user_id}', 
                            '${escapeHtml(claim.user_name)}', 
                            '${escapeHtml(claim.user_email)}', 
                            '${escapeHtml(claim.user_mobile)}',
                            '${escapeHtml(claim.broker_name)}', 
                            '${escapeHtml(claim.referred_name) || ''}', 
                            '${escapeHtml(claim.referred_email) || ''}', 
                            '${escapeHtml(claim.referred_mobile) || ''}', 
                            '${claim.proof_screenshot || ''}'
                        )">✅ Approve & Add ₹100</button>
                        <button class="reject-btn" onclick="rejectClaim(
                            '${claim.id}', 
                            '${claim.user_id}', 
                            '${escapeHtml(claim.user_name)}', 
                            '${escapeHtml(claim.user_email)}', 
                            '${escapeHtml(claim.user_mobile)}',
                            '${escapeHtml(claim.broker_name)}', 
                            '${claim.proof_screenshot || ''}'
                        )">❌ Reject</button>
                    </div>
                </div>
            `
        }
        container.innerHTML = html
    }
    
    // ✅ APPROVE CLAIM FUNCTION
    window.approveClaim = async function(id, userId, userName, userEmail, userMobile, brokerName, referredName, referredEmail, referredMobile, screenshotUrl) {
        if (!confirm(`✅ Approve claim for ${userName}?\n\n₹100 will be added to wallet.`)) return
        
        const claimDiv = document.getElementById(`claim-${id}`)
        const btn = claimDiv?.querySelector('.approve-btn')
        const rejectBtn = claimDiv?.querySelector('.reject-btn')
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span> Processing...' }
        if (rejectBtn) rejectBtn.disabled = true
        
        try {
            // Update earnings
            const { data: existing } = await supabase
                .from('user_earnings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
            
            if (existing) {
                await supabase
                    .from('user_earnings')
                    .update({
                        today_earnings: (existing.today_earnings || 0) + 100,
                        week_earnings: (existing.week_earnings || 0) + 100,
                        month_earnings: (existing.month_earnings || 0) + 100,
                        total_earnings: (existing.total_earnings || 0) + 100,
                        wallet_balance: (existing.wallet_balance || 0) + 100,
                        success_count: (existing.success_count || 0) + 1,
                        airpods_progress: Math.min((existing.airpods_progress || 0) + 1, 20),
                        pending_count: Math.max((existing.pending_count || 1) - 1, 0),
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
            } else {
                await supabase
                    .from('user_earnings')
                    .insert({
                        user_id: userId,
                        today_earnings: 100,
                        week_earnings: 100,
                        month_earnings: 100,
                        total_earnings: 100,
                        wallet_balance: 100,
                        success_count: 1,
                        pending_count: 0,
                        rejected_count: 0,
                        airpods_progress: 1,
                        updated_at: new Date().toISOString()
                    })
            }
            
            // Referral entry
            if (referredEmail && referredEmail !== '') {
                const { data: existingReferral } = await supabase
                    .from('referrals')
                    .select('id')
                    .eq('referrer_id', userId)
                    .eq('referred_user_email', referredEmail)
                    .maybeSingle()
                
                if (!existingReferral) {
                    await supabase
                        .from('referrals')
                        .insert({
                            referrer_id: userId,
                            referred_user_email: referredEmail,
                            referred_user_name: referredName || '',
                            referred_user_mobile: referredMobile || '',
                            broker_name: brokerName,
                            commission_amount: 100,
                            status: 'success',
                            completed_at: new Date().toISOString()
                        })
                }
            }
            
            // Delete screenshot
            if (screenshotUrl && screenshotUrl !== '') {
                try {
                    const parts = screenshotUrl.split('/')
                    const filePath = parts.slice(-2).join('/')
                    await supabase.storage.from('claim-proofs').remove([filePath])
                } catch(e) { console.log("Storage delete warning:", e) }
            }
            
            // Update claim status
            await supabase
                .from('claim_requests')
                .update({ status: 'approved' })
                .eq('id', id)
            
            // ✅ TELEGRAM NOTIFICATION - APPROVED (NO manage link)
            try {
                await supabase.rpc('send_telegram_notification_real', {
                    p_type: 'claim_approved',
                    p_user_name: userName,
                    p_user_email: userEmail,
                    p_user_mobile: userMobile,
                    p_referred_name: referredName || '',
                    p_referred_email: referredEmail || '',
                    p_referred_mobile: referredMobile || '',
                    p_broker_name: brokerName,
                    p_request_id: id.toString()
                });
            } catch (tgErr) {
                console.error("Telegram approve error:", tgErr);
            }
            
            showToast(`✅ Claim approved! ₹100 added to ${userName}'s wallet`, 'success')
            await loadStats()
            await loadClaims()
            
        } catch (err) {
            alert("❌ Error: " + err.message)
            console.error(err)
            if (btn) { btn.disabled = false; btn.innerHTML = '✅ Approve & Add ₹100' }
            if (rejectBtn) rejectBtn.disabled = false
        }
    }
    
    // ✅ REJECT CLAIM FUNCTION
    window.rejectClaim = async function(id, userId, userName, userEmail, userMobile, brokerName, screenshotUrl) {
        if (!confirm(`❌ Reject claim from ${userName}?\n\nClaim will be marked as rejected.`)) return
        
        const claimDiv = document.getElementById(`claim-${id}`)
        const btn = claimDiv?.querySelector('.reject-btn')
        const approveBtn = claimDiv?.querySelector('.approve-btn')
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span> Processing...' }
        if (approveBtn) approveBtn.disabled = true
        
        try {
            // Update rejected count
            const { data: existingReject } = await supabase
                .from('user_earnings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
            
            if (existingReject) {
                await supabase
                    .from('user_earnings')
                    .update({
                        rejected_count: (existingReject.rejected_count || 0) + 1,
                        pending_count: Math.max((existingReject.pending_count || 1) - 1, 0),
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
            }
            
            // Delete screenshot
            if (screenshotUrl && screenshotUrl !== '') {
                try {
                    const parts = screenshotUrl.split('/')
                    const filePath = parts.slice(-2).join('/')
                    await supabase.storage.from('claim-proofs').remove([filePath])
                } catch(e) { console.log("Storage delete warning:", e) }
            }
            
            // Update claim status
            await supabase
                .from('claim_requests')
                .update({ status: 'rejected' })
                .eq('id', id)
            
            // ✅ TELEGRAM NOTIFICATION - REJECTED (NO manage link)
            try {
                await supabase.rpc('send_telegram_notification_real', {
                    p_type: 'claim_rejected',
                    p_user_name: userName,
                    p_user_email: userEmail,
                    p_user_mobile: userMobile,
                    p_referred_name: '',
                    p_referred_email: '',
                    p_referred_mobile: '',
                    p_broker_name: brokerName,
                    p_request_id: id.toString()
                });
            } catch (tgErr) {
                console.error("Telegram reject error:", tgErr);
            }
            
            showToast(`❌ Claim rejected`, 'error')
            await loadStats()
            await loadClaims()
            
        } catch (err) {
            alert("❌ Error: " + err.message)
            console.error(err)
            if (btn) { btn.disabled = false; btn.innerHTML = '❌ Reject' }
            if (approveBtn) approveBtn.disabled = false
        }
    }
    
    async function init() {
        await loadStats()
        await loadClaims()
    }
    
    checkAutoLogin()