import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    
    const supabaseUrl = "https://pxxbwzfxhapbzpznabbe.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGJ3emZ4aGFwYnpwem5hYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDE4MDAsImV4cCI6MjA5NDYxNzgwMH0.v4QD86JrDeIBvBnRfKaq2xWy1_9IYmcLp61UmtoZdE4"
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    let selectedFile = null
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com']
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastMessage')
        if (toast) {
            toast.textContent = message
            toast.className = `toast-message ${type}`
            toast.style.display = 'block'
            setTimeout(() => { toast.style.display = 'none' }, 3000)
        }
    }
    
    function showFieldError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId)
        const error = document.getElementById(errorId)
        if (field && error) {
            field.classList.add('error')
            error.textContent = message
            error.classList.add('show')
            
            field.addEventListener('input', function() {
                field.classList.remove('error')
                error.classList.remove('show')
            }, { once: true })
        }
    }
    
    function clearFieldError(fieldId, errorId) {
        const field = document.getElementById(fieldId)
        const error = document.getElementById(errorId)
        if (field && error) {
            field.classList.remove('error')
            error.classList.remove('show')
        }
    }
    
    async function protectPage() {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
            window.location.replace("index47.html")
            return null
        }
        return data.session
    }
    
    function validateForm() {
        let isValid = true
        
        const referredName = document.getElementById('referredName').value.trim()
        const referredMobile = document.getElementById('referredMobile').value.trim()
        const referredEmail = document.getElementById('referredEmail').value.trim()
        const broker = document.getElementById('brokerName').value
        
        if (!referredName) {
            showFieldError('referredName', 'referredNameError', 'Please enter referred user\'s full name')
            isValid = false
        }
        
        if (!referredEmail) {
            showFieldError('referredEmail', 'referredEmailError', 'Please enter referred user\'s email')
            isValid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referredEmail)) {
            showFieldError('referredEmail', 'referredEmailError', 'Please enter a valid email address')
            isValid = false
        }
        
        if (!referredMobile) {
            showFieldError('referredMobile', 'referredMobileError', 'Please enter referred user\'s mobile number')
            isValid = false
        } else if (!/^[6-9]\d{9}$/.test(referredMobile)) {
            showFieldError('referredMobile', 'referredMobileError', 'Enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)')
            isValid = false
        }
        
        if (!broker) {
            showFieldError('brokerName', 'brokerError', 'Please select a broker')
            isValid = false
        }
        
        if (!selectedFile) {
            showFieldError('screenshot', 'screenshotError', 'Please upload screenshot proof')
            isValid = false
        }
        
        return isValid
    }
    
    window.showFileName = function() {
        const fileInput = document.getElementById('screenshot')
        if(!fileInput) return
        const file = fileInput.files[0]
        clearFieldError('screenshot', 'screenshotError')
        
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("File size should be less than 2MB", "error")
                fileInput.value = ''
                document.getElementById('fileName').innerHTML = ''
                selectedFile = null
                return
            }
            if (!file.type.startsWith('image/')) {
                showToast("Please upload an image file (JPG, PNG, GIF, WEBP)", "error")
                fileInput.value = ''
                document.getElementById('fileName').innerHTML = ''
                selectedFile = null
                return
            }
            selectedFile = file
            document.getElementById('fileName').innerHTML = `✅ ${file.name}`
        }
    }
    
    async function uploadScreenshot(userId) {
        if (!selectedFile) return null
        
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `claim_${userId}_${Date.now()}.${fileExt}`
        const filePath = `claims/${fileName}`
        
        const { error: uploadError } = await supabase.storage
            .from('claim-proofs')
            .upload(filePath, selectedFile)
        
        if (uploadError) {
            console.error("Upload error:", uploadError)
            return null
        }
        
        const { data: urlData } = supabase.storage
            .from('claim-proofs')
            .getPublicUrl(filePath)
        
        return urlData.publicUrl
    }
    
    function showError(message) {
        const errorPopup = document.getElementById('errorPopup')
        const errorMessage = document.getElementById('errorMessage')
        if (errorPopup && errorMessage) {
            errorMessage.textContent = message
            errorPopup.classList.add('active')
            const popupOverlay = document.getElementById('popupOverlay')
            if(popupOverlay) popupOverlay.style.display = 'block'
        }
    }
    
    const emailInput = document.getElementById('referredEmail')
    const suggestionsBox = document.getElementById('emailSuggestions')
    
    if (emailInput && suggestionsBox) {
        emailInput.addEventListener('input', function() {
            const value = this.value
            const atIndex = value.indexOf('@')
            
            if (atIndex !== -1) {
                const localPart = value.substring(0, atIndex)
                const domainPart = value.substring(atIndex + 1)
                
                if (domainPart.length === 0) {
                    suggestionsBox.innerHTML = ''
                    const div = document.createElement('div')
                    div.className = 'suggestion-item'
                    div.textContent = localPart + '@gmail.com'
                    div.onclick = () => {
                        emailInput.value = localPart + '@gmail.com'
                        suggestionsBox.classList.remove('show')
                        clearFieldError('referredEmail', 'referredEmailError')
                    }
                    suggestionsBox.appendChild(div)
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
                                clearFieldError('referredEmail', 'referredEmailError')
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
    
    window.submitClaim = async function() {
        if (!validateForm()) return
        
        const btn = document.getElementById('submitBtn')
        if(!btn) return
        btn.disabled = true
        btn.innerHTML = '<span class="loading-spinner"></span> Submitting...'
        
        try {
            const session = await protectPage()
            if(!session) return
            
            const userId = session.user.id
            const claimantEmail = session.user.email
            const claimantName = session.user.user_metadata?.full_name || claimantEmail.split('@')[0] || 'User'
            const claimantMobile = session.user.user_metadata?.mobile || 'Not Provided'
            
            const referredName = document.getElementById('referredName').value.trim()
            const referredMobile = document.getElementById('referredMobile').value.trim()
            const referredEmail = document.getElementById('referredEmail').value.trim()
            const broker = document.getElementById('brokerName').value
            
            const screenshotUrl = await uploadScreenshot(userId)
            
            if (!screenshotUrl) {
                showError("Failed to upload screenshot. Please try again.")
                btn.disabled = false
                btn.innerHTML = 'Submit Claim →'
                return
            }
            
            const { data: claimData, error: claimError } = await supabase
                .from('claim_requests')
                .insert({
                    user_id: userId,
                    user_name: claimantName,
                    user_email: claimantEmail,
                    user_mobile: claimantMobile,
                    referred_name: referredName,
                    referred_mobile: referredMobile,
                    referred_email: referredEmail,
                    broker_name: broker,
                    proof_screenshot: screenshotUrl,
                    status: 'pending'
                })
                .select()
            
            if (claimError) {
                console.error("Claim save error:", claimError)
                showError("Failed to submit claim: " + claimError.message)
                btn.disabled = false
                btn.innerHTML = 'Submit Claim →'
                return
            }
            
            const claimId = claimData && claimData[0] ? claimData[0].id : 'pending'
            
            const { data: existingEarnings } = await supabase
                .from('user_earnings')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
            
            if (existingEarnings) {
                await supabase
                    .from('user_earnings')
                    .update({
                        pending_count: (existingEarnings.pending_count || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId)
            } else {
                await supabase
                    .from('user_earnings')
                    .insert({
                        user_id: userId,
                        today_earnings: 0,
                        week_earnings: 0,
                        month_earnings: 0,
                        total_earnings: 0,
                        wallet_balance: 0,
                        pending_count: 1,
                        success_count: 0,
                        rejected_count: 0,
                        airpods_progress: 0,
                        updated_at: new Date().toISOString()
                    })
            }
            
            const adminId = 'c83107ce-1135-417d-a4c3-4d61c25369a1'
            const { data: adminEarnings } = await supabase
                .from('user_earnings')
                .select('*')
                .eq('user_id', adminId)
                .maybeSingle()
            
            if (adminEarnings) {
                await supabase
                    .from('user_earnings')
                    .update({
                        pending_count: (adminEarnings.pending_count || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', adminId)
            } else {
                await supabase
                    .from('user_earnings')
                    .insert({
                        user_id: adminId,
                        today_earnings: 0,
                        week_earnings: 0,
                        month_earnings: 0,
                        total_earnings: 0,
                        wallet_balance: 0,
                        pending_count: 1,
                        success_count: 0,
                        rejected_count: 0,
                        airpods_progress: 0,
                        updated_at: new Date().toISOString()
                    })
            }
            
            try {
                await supabase.rpc('send_telegram_notification_real', {
    p_type: 'new_claim',
    p_user_name: claimantName,
    p_user_email: claimantEmail,
    p_user_mobile: claimantMobile,
    p_referred_name: referredName,
    p_referred_email: referredEmail,
    p_referred_mobile: referredMobile,
    p_broker_name: broker,
    p_request_id: String(claimId),
    p_manage_link: 'https://digitalearner-online.github.io/Digital-Earner-/admin-claims.html'
});
            } catch (notifyErr) {
                console.error("Database Notification exception:", notifyErr);
            }
            
            const popup = document.getElementById('successPopup')
            if(popup) popup.classList.add('active')
            const popupOverlay = document.getElementById('popupOverlay')
            if(popupOverlay) popupOverlay.style.display = 'block'
            
            document.getElementById('referredName').value = ''
            document.getElementById('referredMobile').value = ''
            document.getElementById('referredEmail').value = ''
            document.getElementById('brokerName').value = ''
            const screenshotInput = document.getElementById('screenshot')
            if(screenshotInput) screenshotInput.value = ''
            document.getElementById('fileName').innerHTML = ''
            selectedFile = null
            
            btn.disabled = false
            btn.innerHTML = 'Submit Claim →'
            
        } catch (err) {
            console.error("Submit error:", err)
            showError("Something went wrong: " + err.message)
            btn.disabled = false
            btn.innerHTML = 'Submit Claim →'
        }
    }
    
    const mainSubmitBtn = document.getElementById('submitBtn')
    if(mainSubmitBtn) {
        mainSubmitBtn.addEventListener('click', window.submitClaim)
    }
    
    const okBtn = document.getElementById('okBtn')
    if(okBtn) {
        okBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html'
        })
    }
    
    const errorOkBtn = document.getElementById('errorOkBtn')
    if(errorOkBtn) {
        errorOkBtn.addEventListener('click', function() {
            document.getElementById('errorPopup').classList.remove('active')
            const popupOverlay = document.getElementById('popupOverlay')
            if(popupOverlay) popupOverlay.style.display = 'none'
        })
    }
    
    function openMenuOnly() {
        document.getElementById('menu').classList.add('active')
        document.getElementById('overlay').classList.add('active')
        document.body.classList.add('menu-open')
        document.body.style.top = `-${window.scrollY}px`
    }

    function closeMenuOnly() {
        document.getElementById('menu').classList.remove('active')
        document.getElementById('overlay').classList.remove('active')
        document.body.classList.remove('menu-open')
        const scrollY = document.body.style.top
        document.body.style.top = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    
    const menuBtn = document.getElementById('menuBtn')
    const closeMenuBtn = document.getElementById('closeMenuBtn')
    const overlayBtn = document.getElementById('overlay')
    
    if(menuBtn) menuBtn.addEventListener('click', openMenuOnly)
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenuOnly)
    if(overlayBtn) overlayBtn.addEventListener('click', closeMenuOnly)
    
    const backToDashboardBtn = document.getElementById('backToDashboard')
    if(backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html'
        })
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
            window.location.replace("index47.html")
        }
    })
    
    async function loadUserInfo() {
        const session = await protectPage()
        if (session && session.user) {
            const user = session.user
            const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            const mobile = user.user_metadata?.mobile || 'Not Provided'
            
            const nameField = document.getElementById('claimantName')
            const emailField = document.getElementById('claimantEmail')
            const mobileField = document.getElementById('claimantMobile')
            
            if(nameField) nameField.value = name
            if(emailField) emailField.value = user.email || ''
            if(mobileField) mobileField.value = mobile
        }
    }
    
    loadUserInfo()