import { Router } from 'express'
import { createUserClient } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.put('/', async (req, res, next) => {
  try {
    const name = req.body.name?.trim()
    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'O nome deve ter pelo menos 3 caracteres.' })
    }

    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('profiles')
      .update({
        name,
        monthly_goal: Math.max(Number(req.body.monthlyGoal) || 0, 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json({ profile: data })
  } catch (error) {
    next(error)
  }
})

export default router
