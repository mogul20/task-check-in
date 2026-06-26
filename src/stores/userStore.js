import { reactive, watch, computed, ref } from 'vue'
import { loginWithPhone as supabaseLogin, updateUserProfile, getVerificationCode as supabaseGetCode, resetPassword as supabaseResetPassword } from '../supabase/userService'

const USER_KEY = 'daily-goal-user'
const COOKIE_KEY = 'daily_goal_user'
const EXPIRATION_DAYS = 15

// 从localStorage读取
function readFromLocalStorage() {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

// 写入localStorage
function writeToLocalStorage(data) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('写入localStorage失败:', e)
  }
}

// 从cookie读取
function readFromCookie() {
  try {
    const cookie = document.cookie
    const prefix = COOKIE_KEY + '='
    const start = cookie.indexOf(prefix)
    if (start === -1) return null
    
    let end = cookie.indexOf(';', start)
    if (end === -1) end = cookie.length
    
    const encodedValue = cookie.substring(start + prefix.length, end)
    const jsonData = decodeURIComponent(encodedValue)
    return JSON.parse(jsonData)
  } catch (e) {
    return null
  }
}

// 写入cookie
function writeToCookie(data) {
  try {
    const jsonData = JSON.stringify(data)
    const encodedValue = encodeURIComponent(jsonData)
    const expires = new Date(Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${COOKIE_KEY}=${encodedValue}; expires=${expires}; path=/; SameSite=Lax`
  } catch (e) {
    console.error('写入cookie失败:', e)
  }
}

// 验证登录状态是否有效
function isValidSession(data) {
  if (!data || !data.isLoggedIn || !data.lastLoginTime) return false
  
  const now = Date.now()
  const lastLogin = new Date(data.lastLoginTime).getTime()
  const diffDays = (now - lastLogin) / (1000 * 60 * 60 * 24)
  
  return diffDays <= EXPIRATION_DAYS
}

// 获取存储的用户数据（优先localStorage，其次cookie）
function getStoredUserData() {
  // 优先从localStorage读取
  let data = readFromLocalStorage()
  if (data && isValidSession(data)) {
    console.log('从localStorage恢复登录状态:', data.userName)
    return data
  }
  
  // 备用：从cookie读取
  data = readFromCookie()
  if (data && isValidSession(data)) {
    console.log('从cookie恢复登录状态:', data.userName)
    // 恢复到localStorage
    writeToLocalStorage(data)
    return data
  }
  
  console.log('没有有效的登录状态')
  return null
}

// 保存用户数据（同时写入localStorage和cookie）
function persistUserData(userData) {
  writeToLocalStorage(userData)
  writeToCookie(userData)
  console.log('登录状态已保存:', userData.userName)
}

// 创建响应式用户对象
const defaultUser = {
  isLoggedIn: false,
  userId: null,
  userName: '',
  avatar: '',
  loginType: '',
  createdAt: '',
  lastLoginTime: null
}

// 初始化用户数据
const storedData = getStoredUserData()
const initialData = storedData || defaultUser

export const user = reactive(initialData)

// 创建一个计算属性来确保响应式更新
export const isLoggedIn = computed(() => user.isLoggedIn)

// 标记是否已经初始化完成
const isInitialized = ref(false)

// 监听用户状态变化并保存（只在初始化完成后触发）
watch(user, (newVal) => {
  if (isInitialized.value) {
    persistUserData(newVal)
  }
}, { deep: true })

// 设置初始化完成标记
setTimeout(() => {
  isInitialized.value = true
  console.log('userStore初始化完成', user.isLoggedIn ? `已登录: ${user.userName}` : '未登录')
}, 100)

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
  
  // 清除存储
  localStorage.removeItem(USER_KEY)
  document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
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

// 手动重新初始化登录状态（用于确保状态正确）
export function reinitializeUserState() {
  const storedData = getStoredUserData()
  if (storedData) {
    Object.assign(user, storedData)
    console.log('手动重新初始化登录状态成功:', user.userName)
    return true
  }
  console.log('手动重新初始化登录状态失败')
  return false
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
