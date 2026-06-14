import { reactive, watch } from 'vue'
import { loginWithPhone as supabaseLogin, updateUserProfile, getVerificationCode as supabaseGetCode, resetPassword as supabaseResetPassword } from '../supabase/userService'

const USER_KEY = 'daily-goal-user'
const SESSION_KEY = 'daily-goal-session'
const EXPIRATION_DAYS = 15

function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

function isSessionStorageAvailable() {
  try {
    const test = '__session_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

function loadFromStorage(key, defaultValue) {
  try {
    // 优先使用 localStorage
    if (isLocalStorageAvailable()) {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed && parsed.isLoggedIn && parsed.lastLoginTime) {
          const now = Date.now()
          const lastLogin = new Date(parsed.lastLoginTime).getTime()
          const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
          if (diffDays > EXPIRATION_DAYS) {
            console.log('登录状态已过期')
            return { ...defaultValue }
          }
          console.log('从localStorage恢复登录状态', parsed.userName)
          // 同时备份到 sessionStorage
          if (isSessionStorageAvailable()) {
            sessionStorage.setItem(key, data)
          }
          return parsed
        }
      }
    }
    
    // 备用：尝试从 sessionStorage 恢复
    if (isSessionStorageAvailable()) {
      const sessionData = sessionStorage.getItem(key)
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (parsed && parsed.isLoggedIn && parsed.lastLoginTime) {
          const now = Date.now()
          const lastLogin = new Date(parsed.lastLoginTime).getTime()
          const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
          if (diffDays <= EXPIRATION_DAYS) {
            console.log('从sessionStorage恢复登录状态', parsed.userName)
            // 恢复到 localStorage
            if (isLocalStorageAvailable()) {
              localStorage.setItem(key, sessionData)
            }
            return parsed
          }
        }
      }
    }
    
    return defaultValue
  } catch (e) {
    console.error('加载登录状态失败', e)
    return defaultValue
  }
}

function saveToStorage(key, value) {
  const jsonData = JSON.stringify(value)
  
  // 保存到 localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(key, jsonData)
    } catch (e) {
      console.error('保存到localStorage失败', e)
    }
  }
  
  // 同时备份到 sessionStorage
  if (isSessionStorageAvailable()) {
    try {
      sessionStorage.setItem(key, jsonData)
    } catch (e) {
      console.error('保存到sessionStorage失败', e)
    }
  }
}

export const user = reactive(loadFromStorage(USER_KEY, {
  isLoggedIn: false,
  userId: null,
  userName: '',
  avatar: '',
  loginType: '',
  createdAt: '',
  lastLoginTime: null
}))

// 监听用户状态变化并保存
watch(user, (newVal) => {
  saveToStorage(USER_KEY, newVal)
  console.log('用户状态已保存', newVal.isLoggedIn ? newVal.userName : '已退出')
}, { deep: true })

// 调试：输出初始化状态
console.log('userStore初始化完成', user.isLoggedIn ? `已登录: ${user.userName}` : '未登录')

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
    user.createdAt = result.createdAt || ''
    user.lastLoginTime = new Date().toISOString()
    
    // 显式保存到localStorage
    saveToStorage(USER_KEY, {
      isLoggedIn: true,
      userId: result.userId,
      userName: result.userName,
      avatar: user.avatar,
      loginType: 'phone',
      createdAt: result.createdAt || '',
      lastLoginTime: user.lastLoginTime
    })
    
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
  user.createdAt = ''
  user.lastLoginTime = null
  
  // 显式保存退出状态
  saveToStorage(USER_KEY, {
    isLoggedIn: false,
    userId: null,
    userName: '',
    avatar: '',
    loginType: '',
    createdAt: '',
    lastLoginTime: null
  })
}

export function isSessionValid() {
  if (!user.isLoggedIn || !user.lastLoginTime) {
    return false
  }
  const now = Date.now()
  const lastLogin = new Date(user.lastLoginTime).getTime()
  const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
  return diffDays <= EXPIRATION_DAYS
}

export function checkAndRefreshSession() {
  if (user.isLoggedIn && !isSessionValid()) {
    logout()
    return false
  }
  return user.isLoggedIn
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
