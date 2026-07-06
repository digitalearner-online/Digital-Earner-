
    import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";

    let sessionUser = null

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastMessage')
        toast.textContent = message
        toast.className = `toast-message ${type}`
        toast.style.display = 'block'
        setTimeout(() => toast.style.display = 'none', 3000)
    }

    async function protectPage() {
    const session = await getSession();
    
    if (!session) {
        window.location.replace("index47.html");
        return null;
    }
    
    sessionUser = session.user;
    return session;
}
    async function loadWithdrawData() {
        if (!sessionUser) return

        const userId = sessionUser.id;
        
        const { data: earnings, error } = await supabase
    .from('user_earnings')
    .select('wallet_balance')
    .eq('user_id', userId)
    .single();
if (earnings) {
    document.getElementById('walletBalance').innerText = earnings.wallet_balance || 0;
}

        // Withdrawal stats
        const { data: requests } = await supabase
            .from('withdrawal_requests')
            .select('status, amount')
            .eq('user_id', userId)

        let pending = 0, approved = 0, rejected = 0, totalWithdrawn = 0
        if (requests) {
            requests.forEach(r => {
                if (r.status === 'pending') pending++
                else if (r.status === 'approved') { approved++; totalWithdrawn += r.amount }
                else if (r.status === 'rejected') rejected++
            })
        }

        document.getElementById('pendingCount').innerText = pending
        document.getElementById('approvedCount').innerText = approved
        document.getElementById('rejectedCount').innerText = rejected
        document.getElementById('totalWithdrawn').innerText = totalWithdrawn

        // History
        const { data: history } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('user_id', userId)
            .order('requested_at', { ascending: false })
            .limit(10)

        const historyList = document.getElementById('historyList')
        if (!history || history.length === 0) {
            historyList.innerHTML = '<p style="color:#94a3b8; font-size:13px; text-align:center;">No withdrawals yet</p>'
            return
        }

        let html = ''
        history.forEach(h => {
            const date = new Date(h.requested_at).toLocaleDateString()
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-amount">₹${h.amount}</span>
                        <span class="history-date">${date}</span>
                    </div>
                    <span class="history-status ${h.status}">${h.status.toUpperCase()}</span>
                </div>
            `
        })
        historyList.innerHTML = html
    }

    window.submitWithdraw = async function() {
        const amount = parseInt(document.getElementById('withdrawAmount').value)
        const upi = document.getElementById('upiId').value.trim()

        if (!amount || isNaN(amount)) {
    showToast('Please enter a valid amount', 'error');
    return;
}

if (amount < 100) {
    showToast('Minimum withdrawal amount is ₹100', 'error');
    return;
}
        if (!upi) {
    showToast('Please enter your UPI ID', 'error');
    return;
}

const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

if (!upiRegex.test(upi)) {
    showToast('Please enter a valid UPI ID', 'error');
    return;
}

        const btn = document.getElementById('withdrawBtn')
        btn.disabled = true
        btn.innerHTML = '<span class="loading-spinner"></span> Processing...'

        try {
            const { data: earnings } = await supabase
                .from('user_earnings')
                .select('wallet_balance')
                .eq('user_id', sessionUser.id)
                .single()
const walletBalance = Number(earnings?.wallet_balance || 0);
            if (walletBalance < amount) {
    showToast(`Insufficient balance. Available: ₹${walletBalance}`, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Withdraw Now';
    return;
}
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
    throw new Error("User not found");
}
            const { data: insertedRequest, error: insertError } = await supabase
    .from('withdrawal_requests')
    .insert({
    user_id: sessionUser.id,
    full_name: user.user_metadata?.full_name || "User",
    email: user.email || "",
    mobile: user.user_metadata?.mobile || "",
    amount: amount,
    upi_id: upi,
    status: 'pending',
    requested_at: new Date().toISOString()
})
    .select()
    .single()

            if (insertError) {
    throw new Error(insertError.message)
}

const { error: telegramError } = await supabase.rpc(
    'send_withdrawal_telegram_notification',
    {
        p_type: 'new_withdrawal',
        p_user_name: user.user_metadata?.full_name || 'User',
        p_user_email: user.email || '',
        p_user_mobile: user.user_metadata?.mobile || '',
        p_amount: amount,
        p_upi_id: upi,
        p_request_id: insertedRequest.id.toString(),
       p_manage_link: 'https://digitalearner-online.github.io/Digital-Earner-/html/admin-withdraw.html'
    }
);

if (telegramError) {
    console.error('Telegram Error:', telegramError);
}
const { error: walletError } = await supabase
    .from('user_earnings')
    .update({
        wallet_balance: walletBalance - amount
    })
    .eq('user_id', sessionUser.id);

if (walletError) {
    throw walletError;
}

showToast('✅ Withdrawal request submitted!', 'success');

document.getElementById('withdrawAmount').value = '';
document.getElementById('upiId').value = '';

await loadWithdrawData();

} catch (err) {
    console.error(err);
    alert(err.stack);
    showToast('❌ ' + err.message, 'error');
}
btn.disabled = false;
btn.innerHTML = 'Withdraw Now';
}
    const menu = document.getElementById('menu'), overlay = document.getElementById('overlay'), menuBtn = document.getElementById('menuBtn'), closeMenuBtn = document.getElementById('closeMenuBtn')
    function openMenuOnly() { menu.classList.add('active'); overlay.classList.add('active'); document.body.classList.add('menu-open'); document.body.style.top = `-${window.scrollY}px` }
    function closeMenuOnly() { menu.classList.remove('active'); overlay.classList.remove('active'); document.body.classList.remove('menu-open'); const scrollY = document.body.style.top; document.body.style.top = ''; window.scrollTo(0, parseInt(scrollY || '0') * -1) }
    if (menuBtn) menuBtn.addEventListener('click', openMenuOnly)
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenuOnly)
    if (overlay) overlay.addEventListener('click', closeMenuOnly)
    async function init() {
    document.getElementById('loading').style.display = 'flex';
    
    const session = await protectPage();
    if (session) {
        await loadWithdrawData();
    }
    
    document.getElementById('loading').style.display = 'none';
}

init();
    document.getElementById('backToDashboard').addEventListener('click', () => window.location.href = 'dashboard.html')