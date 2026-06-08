import { Router } from 'express'
import { createUserClient } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validateCategory } from '../utils/validation.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    res.json({ categories: data })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const errors = validateCategory(req.body)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('categories')
      .insert({
        user_id: req.user.id,
        name: req.body.name.trim(),
        color: req.body.color || '#6c5ce7'
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ category: data })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Já existe uma categoria com esse nome.' })
    }
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateCategory(req.body)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('categories')
      .update({
        name: req.body.name.trim(),
        color: req.body.color || '#6c5ce7',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ category: data })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Já existe uma categoria com esse nome.' })
    }
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
