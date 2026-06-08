import { Router } from 'express'
import { createUserClient } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validateTransaction } from '../utils/validation.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 1000)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = client
      .from('transactions')
      .select('*, category:categories(id, name, color)', { count: 'exact' })
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (req.query.type === 'income' || req.query.type === 'expense') {
      query = query.eq('type', req.query.type)
    }
    if (req.query.categoryId) {
      query = query.eq('category_id', req.query.categoryId)
    }
    if (req.query.startDate) {
      query = query.gte('transaction_date', req.query.startDate)
    }
    if (req.query.endDate) {
      query = query.lte('transaction_date', req.query.endDate)
    }
    if (req.query.search) {
      const search = req.query.search.replace(/[%_,()]/g, '').trim()
      if (search) query = query.ilike('description', `%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    res.json({
      transactions: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

router.get('/summary', async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    let query = client
      .from('transactions')
      .select('id, description, amount, type, transaction_date, category:categories(name, color)')
      .order('transaction_date', { ascending: false })

    if (req.query.startDate) query = query.gte('transaction_date', req.query.startDate)
    if (req.query.endDate) query = query.lte('transaction_date', req.query.endDate)

    const { data, error } = await query
    if (error) throw error

    const summary = data.reduce(
      (accumulator, transaction) => {
        const amount = Number(transaction.amount)
        if (transaction.type === 'income') accumulator.income += amount
        if (transaction.type === 'expense') accumulator.expense += amount
        return accumulator
      },
      { income: 0, expense: 0 }
    )

    summary.balance = summary.income - summary.expense
    summary.total = data.length

    res.json({
      summary,
      recent: data.slice(0, 5),
      transactions: data
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const errors = validateTransaction(req.body)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: req.user.id,
        category_id: req.body.categoryId || null,
        description: req.body.description.trim(),
        amount: Number(req.body.amount),
        type: req.body.type,
        transaction_date: req.body.transaction_date,
        notes: req.body.notes?.trim() || null
      })
      .select('*, category:categories(id, name, color)')
      .single()

    if (error) throw error
    res.status(201).json({ transaction: data })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateTransaction(req.body)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const client = createUserClient(req.accessToken)
    const { data, error } = await client
      .from('transactions')
      .update({
        category_id: req.body.categoryId || null,
        description: req.body.description.trim(),
        amount: Number(req.body.amount),
        type: req.body.type,
        transaction_date: req.body.transaction_date,
        notes: req.body.notes?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, category:categories(id, name, color)')
      .single()

    if (error) throw error
    res.json({ transaction: data })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
