import { supabase } from './config'

export async function loginWithPhone(username, password) {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('请输入账号')
    }
    if (!password || password.length === 0) {
      throw new Error('请输入密码')
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', username)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let user
    if (existingUser) {
      if (existingUser.password && existingUser.password !== password) {
        throw new Error('密码错误')
      }
      user = existingUser
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ phone: username, password: password, name: '打卡菇' })
        .select('*')
        .single()

      if (insertError) throw insertError
      user = newUser
    }

    return {
      userId: user.id,
      userName: user.name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    }
  } catch (error) {
    throw error
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export function getVerificationCode(phone) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      resolve(code)
    }, 500)
  })
}

export async function resetPassword(username, newPassword) {
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', username)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (!existingUser) {
      throw new Error('账号不存在')
    }

    const { data, error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('phone', username)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}
