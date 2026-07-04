import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    
    const supabase = createClient(
        "https://pxxbwzfxhapbzpznabbe.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4"
    )
    
    function showToast(message, type) {
        const toast = document.getElementById('toastMessage')
        toast.textContent = message
        toast.className = `toast-message ${type}`
        toast.style.display = 'block'
        setTimeout(() => toast.style.display = 'none', 3000)
    }
    
    function isAdminLoggedIn() {
        const local = localStorage.getItem('admin_logged_in')
        const expiry = localStorage.getItem('admin_expiry')
        if (local === 'true' && expiry && parseInt(expiry) > Date.now()) return true
        if (sessionStorage.getItem('admin_logged_in') === 'true') return true
        return false
    }
    
    if (!isAdminLoggedIn()) {
        window.location.href = 'private/index.html'
    }
    
    window.logoutAdmin = function() {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = 'private/index.html'
    }
    
    let currentStatus = 'pending'
    
    async function loadSummary() {
        const { data } = await supabase.from('withdrawal_requests').select('status, amount')
        if (data) {
            let pending = 0, approved = 0, rejected = 0
            data.forEach(d => {
                if (d.status === 'pending') pending += d.amount
                else if (d.status === 'approved') approved += d.amount
                else if (d.status === 'rejected') rejected += d.amount
            })
            document.getElementById('pendingAmount').innerHTML = '₹' + pending
            document.getElementById('approvedAmount').innerHTML = '₹' + approved
            document.getElementById('rejectedAmount').innerHTML = '₹' + rejected
        }
    }
    
    function escapeHtml(str) {
        if (!str) return '—'
        return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))
    }
    
    async function loadRequests() {
        const { data } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .order('requested_at', { ascending: false })
            .order('requested_at', { ascending: false })
        
        const container = document.getElementById('requestsList')
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="no-requests">✅ No ${currentStatus} requests</div>`
            return
        }
        
        let html = ''
        for (const req of data) {
            html += `
                <div class="request-item" id="req-${req.id}">
                    <div class="request-header">
                        <span class="request-id">#${req.id}</span>
                        <span class="request-date">📅 ${new Date(req.requested_at).toLocaleString()}</span>
                        <span class="status-badge status-${req.status}">${req.status.toUpperCase()}</span>
                    </div>
                    <div class="request-details">
                        <div class="detail-item"><span class="detail-label">User ID</span><span class="detail-value">${escapeHtml(req.user_id)}</span></div>
                        <div class="detail-item"><span class="detail-label">Amount</span><span class="detail-value">₹${req.amount}</span></div>
                        <div class="detail-item"><span class="detail-label">UPI ID</span><span class="detail-value">${escapeHtml(req.upi_id)}</span></div>
                    </div>
            `
            if (req.status === 'pending') {
                html += `<div class="action-buttons">
                            <button class="approve-btn" onclick="approveWithdrawal('${req.id}', '${req.user_id}', ${req.amount})">✅ Approve</button>
                            <button class="reject-btn" onclick="rejectWithdrawal('${req.id}', '${req.user_id}', ${req.amount})">❌ Reject</button>
                        </div>`
            }
            html += `</div>`
        }
        container.innerHTML = html
    }
    
    window.approveWithdrawal = async function(id, userId, amount) {
        if (!confirm(`✅ Approve withdrawal of ₹${amount}?`)) return
        
        const btn = document.querySelector(`#req-${id} .approve-btn`)
        const rejectBtn = document.querySelector(`#req-${id} .reject-btn`)
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span> Processing...' }
        if (rejectBtn) rejectBtn.disabled = true
        
        try {
        const { data: earn } = await supabase
    .from('user_earnings')
    .select('wallet_balance')
    .eq('user_id', userId)
    .single();

if (earn) {
    await supabase
        .from('user_earnings')
        .update({
            wallet_balance: Math.max((earn.wallet_balance || 0) - amount, 0)
        })
        .eq('user_id', userId);
}
            await supabase
                .from('withdrawal_requests')
                .update({ status: 'approved', processed_at: new Date().toISOString() })
                .eq('id', id)
            
            showToast(`✅ Withdrawal of ₹${amount} approved!`, 'success')
            await loadSummary()
            await loadRequests()
        } catch (err) {
            alert("Error: " + err.message)
            if (btn) { btn.disabled = false; btn.innerHTML = '✅ Approve' }
            if (rejectBtn) rejectBtn.disabled = false
        }
    }
    
    window.rejectWithdrawal = async function(id, userId, amount) {
        if (!confirm(`❌ Reject withdrawal of ₹${amount}? Amount will be returned to wallet.`)) return
        
        const btn = document.querySelector(`#req-${id} .reject-btn`)
        const approveBtn = document.querySelector(`#req-${id} .approve-btn`)
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loading-spinner"></span> Processing...' }
        if (approveBtn) approveBtn.disabled = true
        
        try {
            const { data: earn } = await supabase
                .from('user_earnings')
                .select('wallet_balance')
                .eq('user_id', userId)
                .single()
            
            if (earn) {
                await supabase
                    .from('user_earnings')
                    .update({ wallet_balance: (earn.wallet_balance || 0) + amount })
                    .eq('user_id', userId)
            }
            
            await supabase
                .from('withdrawal_requests')
                .update({ status: 'rejected', processed_at: new Date().toISOString() })
                .eq('id', id)
            
            showToast(`❌ Withdrawal of ₹${amount} rejected!`, 'error')
            await loadSummary()
            await loadRequests()
        } catch (err) {
            alert("Error: " + err.message)
            if (btn) { btn.disabled = false; btn.innerHTML = '❌ Reject' }
            if (approveBtn) approveBtn.disabled = false
        }
    }
    async function init() {
        await loadSummary()
        await loadRequests()
    }
    
    init()