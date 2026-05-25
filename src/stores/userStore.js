import { reactive, watch } from 'vue'
import { loginWithPhone as supabaseLogin, updateUserProfile, getVerificationCode as supabaseGetCode, resetPassword as supabaseResetPassword } from '../supabase/userService'

const USER_KEY = 'daily-goal-user'

function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const user = reactive(loadFromStorage(USER_KEY, {
  isLoggedIn: false,
  userId: null,
  userName: '',
  avatar: '',
  loginType: ''
}))

watch(user, (newVal) => {
  saveToStorage(USER_KEY, newVal)
}, { deep: true })

export async function loginWithPhone(phone, code) {
  try {
    if (!phone || phone.length !== 11) {
      throw new Error('请输入正确的手机号')
    }
    if (!code || code.length === 0) {
      throw new Error('请输入密码')
    }

    const result = await supabaseLogin(phone, code)
    
    user.isLoggedIn = true
    user.userId = result.userId
    user.userName = result.userName
    user.avatar = result.avatarUrl || 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=user%20avatar%20icon%20orange%20simple&image_size=square'
    user.loginType = 'phone'
    
    return true
  } catch (error) {
    throw error
  }
}

export function logout() {
  user.isLoggedIn = false
  user.userId = null
  user.userName = ''
  user.avatar = ''
  user.loginType = ''
}

export async function updateAvatar(avatarUrl) {
  if (user.isLoggedIn && user.userId) {
    try {
      await updateUserProfile(user.userId, { avatar_url: avatarUrl })
    } catch (error) {
      console.error('Failed to update avatar:', error)
    }
  }
  user.avatar = avatarUrl
}

export async function updateUsername(username) {
  if (user.isLoggedIn && user.userId) {
    try {
      await updateUserProfile(user.userId, { name: username })
    } catch (error) {
      console.error('Failed to update username:', error)
    }
  }
  user.userName = username
}

export function getVerificationCode(phone) {
  return supabaseGetCode(phone)
}

export function getUserInfo() {
  return { ...user }
}

export async function resetPassword(username, newPassword) {
  try {
    if (!username || username.length !== 11) {
      throw new Error('请输入正确的手机号')
    }
    if (!newPassword || newPassword.length === 0) {
      throw new Error('请输入新密码')
    }

    await supabaseResetPassword(username, newPassword)
    return true
  } catch (error) {
    throw error
  }
}
