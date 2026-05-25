import { supabase } from './config'

export async function addTask(userId, task) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        name: task.name,
        description: task.description,
        start_date: task.startDate,
        end_date: task.endDate,
        color: task.color
      })
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function getTasks(userId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function updateTask(userId, taskId, updates) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', taskId)
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function deleteTask(userId, taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('id', taskId)

    if (error) throw error
    return true
  } catch (error) {
    throw error
  }
}

export async function getTaskById(userId, taskId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('id', taskId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function checkin(userId, taskId, comment, date) {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('checkin_records')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .eq('checkin_date', date)
      .single()

    let result
    if (existingRecord) {
      const { data, error } = await supabase
        .from('checkin_records')
        .update({
          completed: true,
          comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select('*')
        .single()

      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabase
        .from('checkin_records')
        .insert({
          user_id: userId,
          task_id: taskId,
          checkin_date: date,
          completed: true,
          comment: comment
        })
        .select('*')
        .single()

      if (error) throw error
      result = data
    }

    return result
  } catch (error) {
    throw error
  }
}

export async function getCheckinRecords(userId, taskId = null, date = null) {
  try {
    let query = supabase
      .from('checkin_records')
      .select('*')
      .eq('user_id', userId)

    if (taskId) {
      query = query.eq('task_id', taskId)
    }

    if (date) {
      query = query.eq('checkin_date', date)
    }

    const { data, error } = await query.order('checkin_date', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

export async function getCheckinStats(userId, startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('checkin_records')
      .select('*')
      .eq('user_id', userId)
      .gte('checkin_date', startDate)
      .lte('checkin_date', endDate)

    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}
