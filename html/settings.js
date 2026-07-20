import { supabase } from "./supabase.auth.js";
import { getSession } from "./auth.js";
    
    const BUCKET_NAME = "profile-images"
    let currentUser = null
    let selectedImageFile = null
    
    window.switchTab = function(panelId) {
        document.querySelectorAll('.settings-card').forEach(card => card.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(panelId).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toastMessage')
        if (toast) {
            toast.textContent = message
            toast.className = `toast-message ${type}`
            toast.style.display = 'block'
            setTimeout(() => { toast.style.display = 'none' }, 3000)
        }
    }
    
    async function protectPage() {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
            window.location.replace("../html/login.html")
            return false
        }
        currentUser = data.session.user
        return true
    }
    
    async function loadUserData() {
        if (!currentUser) return
        
        const name = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]
        const mobile = currentUser.user_metadata?.mobile || ''
        
        document.getElementById('fullName').value = name
        document.getElementById('email').value = currentUser.email
        document.getElementById('mobile').value = mobile
        
        document.getElementById('bannerName').textContent = name
        document.getElementById('bannerEmail').textContent = currentUser.email
        
        await loadProfileImage(currentUser.id)
    }
    
    async function loadProfileImage(userId) {
        try {
            const { data, error } = await supabase
                .storage
                .from(BUCKET_NAME)
                .download(`${userId}/profile.jpg`)
            
            if (data) {
                const url = URL.createObjectURL(data)
                const img = document.getElementById("profileImg")
                const initial = document.getElementById("profileInitial")
                if(img && initial) {
                    img.src = url
                    img.style.display = "block"
                    initial.style.display = "none"
                }
            }
        } catch (error) {
            console.log("No profile image found")
        }
    }
    
    async function uploadProfileImage(userId) {
        if (!selectedImageFile) return true
        const file = selectedImageFile
        try {
            const { error: uploadError } = await supabase
                .storage
                .from(BUCKET_NAME)
                .upload(`${userId}/profile.jpg`, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                })
            
            if (uploadError) {
                console.error("Upload error:", uploadError)
                showToast("❌ Failed to upload image", "error")
                return false
            }
            showToast("✅ Profile image updated!", "success")
            return true
        } catch (err) {
            console.error("Upload error:", err)
            return false
        }
    }
    
    window.updateProfileData = async function() {
        const fullName = document.getElementById('fullName').value.trim()
        const mobile = document.getElementById('mobile').value.trim()
        let hasError = false
        
        if (!fullName) {
            document.getElementById('nameError').textContent = "Full name is required"
            document.getElementById('nameError').style.display = "block"
            document.getElementById('fullName').classList.add('error')
            hasError = true
        } else if (!/^[A-Za-z\s]+$/.test(fullName)) {
            document.getElementById('nameError').textContent = "Name should contain only letters"
            document.getElementById('nameError').style.display = "block"
            document.getElementById('fullName').classList.add('error')
            hasError = true
        } else {
            document.getElementById('nameError').style.display = "none"
            document.getElementById('fullName').classList.remove('error')
        }
        
        if (mobile && (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile))) {
            document.getElementById('mobileError').textContent = "Enter a valid 10-digit Indian mobile number"
            document.getElementById('mobileError').style.display = "block"
            document.getElementById('mobile').classList.add('error')
            hasError = true
        } else {
            document.getElementById('mobileError').style.display = "none"
            document.getElementById('mobile').classList.remove('error')
        }
        
        if (hasError) return
        
        document.getElementById('loading').style.display = 'flex'
        
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { full_name: fullName, mobile: mobile }
            })
            if (updateError) throw new Error(updateError.message)
            
            await uploadProfileImage(currentUser.id)
            showToast("✅ Details saved successfully!", "success")
            
            const sessionData = await supabase.auth.getSession()
            if(sessionData.data.session) currentUser = sessionData.data.session.user
            await loadUserData()
        } catch (err) {
            showToast("❌ " + err.message, "error")
        } finally {
            document.getElementById('loading').style.display = 'none'
        }
    }

    window.updatePasswordData = async function() {
        const currentPassword = document.getElementById('currentPassword').value
        const newPassword = document.getElementById('newPassword').value
        const confirmPassword = document.getElementById('confirmPassword').value
        let hasError = false
        
        if (!currentPassword) {
            document.getElementById('currentPassError').textContent = "Current password is required"
            document.getElementById('currentPassError').style.display = "block"
            document.getElementById('currentPassword').classList.add('error')
            hasError = true
        } else {
            document.getElementById('currentPassError').style.display = "none"
            document.getElementById('currentPassword').classList.remove('error')
        }

        if (!newPassword) {
            document.getElementById('newPassError').textContent = "New password is required"
            document.getElementById('newPassError').style.display = "block"
            document.getElementById('newPassword').classList.add('error')
            hasError = true
        } else if (newPassword.length < 6) {
            document.getElementById('newPassError').textContent = "Password must be at least 6 characters"
            document.getElementById('newPassError').style.display = "block"
            document.getElementById('newPassword').classList.add('error')
            hasError = true
        } else {
            document.getElementById('newPassError').style.display = "none"
            document.getElementById('newPassword').classList.remove('error')
        }
        
        if (newPassword !== confirmPassword) {
            document.getElementById('confirmPassError').textContent = "Passwords do not match"
            document.getElementById('confirmPassError').style.display = "block"
            document.getElementById('confirmPassword').classList.add('error')
            hasError = true
        } else {
            document.getElementById('confirmPassError').style.display = "none"
            document.getElementById('confirmPassword').classList.remove('error')
        }
        
        if (hasError) return
        document.getElementById('loading').style.display = 'flex'
        
        try {
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: currentUser.email,
                password: currentPassword
            })
            
            if (verifyError) {
                document.getElementById('currentPassError').textContent = "Incorrect current password"
                document.getElementById('currentPassError').style.display = "block"
                document.getElementById('currentPassword').classList.add('error')
                throw new Error("Current password mismatch")
            }

            const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
            if (passwordError) throw new Error(passwordError.message)
            
            showToast("✅ Password changed successfully!", "success")
            document.getElementById('currentPassword').value = ''
            document.getElementById('newPassword').value = ''
            document.getElementById('confirmPassword').value = ''
        } catch (err) {
            if(err.message !== "Current password mismatch") {
                showToast("❌ " + err.message, "error")
            }
        } finally {
            document.getElementById('loading').style.display = 'none'
        }
    }

    window.triggerPasswordResetEmail = async function() {
        if (!currentUser || !currentUser.email) return
        document.getElementById('loading').style.display = 'flex'
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
                redirectTo: window.location.origin + '/html/reset-password.html',
            })
            if (error) throw error
            showToast("✉️ Secure reset link sent to your email!", "success")
        } catch(err) {
            showToast("❌ " + err.message, "error")
        } finally {
            document.getElementById('loading').style.display = 'none'
        }
    }
    
    document.getElementById('profileUpload').addEventListener('change', function(event) {
        const file = event.target.files[0]
        if (!file) return
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            showToast("❌ Invalid file type. Use JPG, PNG, GIF, or WEBP", "error")
            return
        }
        
        if (file.size > 2 * 1024 * 1024) {
            showToast("❌ File too large! Maximum 2MB", "error")
            return
        }
        
        selectedImageFile = file
        const reader = new FileReader()
        reader.onload = function(e) {
            const img = document.getElementById("profileImg")
            const initial = document.getElementById("profileInitial")
            if(img && initial) {
                img.src = e.target.result
                img.style.display = "block"
                initial.style.display = "none"
            }
        }
        reader.readAsDataURL(file)
        showToast("📸 Image selected. Click Save Details to upload.", "success")
    })
    
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('error')
            let errorId = ''
            if(this.id === 'fullName') errorId = 'nameError'
            else if(this.id === 'mobile') errorId = 'mobileError'
            else if(this.id === 'currentPassword') errorId = 'currentPassError'
            else if(this.id === 'newPassword') errorId = 'newPassError'
            else if(this.id === 'confirmPassword') errorId = 'confirmPassError'
            
            const errorEl = document.getElementById(errorId)
            if (errorEl) errorEl.style.display = 'none'
        })
    })
    
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

    window.confirmLogout = async function() {
        document.getElementById('logoutPopup').style.display = 'none'
        await supabase.auth.signOut()
        localStorage.removeItem('hasAccount')
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
        window.location.replace('../html/login.html')
    }
    
    document.getElementById('menuBtn').addEventListener('click', openMenuOnly)
    document.getElementById('closeMenuBtn').addEventListener('click', closeMenuOnly)
    document.getElementById('backToDashboard').addEventListener('click', () => {
        window.location.href='../html/my-dashboard.html'
    })
    
    protectPage().then((isLoggedIn) => {
        if(isLoggedIn) loadUserData()
    })