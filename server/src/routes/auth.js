import { Router } from 'express'
import { supabase, createUserClient } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { validateCredentials } from '../utils/validation.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const errors = validateCredentials(req.body, true)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const { name, email, password } = req.body
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() }
      }
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    res.status(201).json({
      message: data.session
        ? 'Conta criada com sucesso.'
        : 'Conta criada, mas a confirmação de e-mail ainda está ativa no Supabase. Desative essa opção e crie a conta novamente.',
      user: data.user,
      session: data.session
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const errors = validateCredentials(req.body)
    if (errors.length) {
      return res.status(400).json({ message: errors[0], errors })
    }

    const { email, password } = req.body
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })

    if (error) {
      if (error.code === 'email_not_confirmed') {
        return res.status(401).json({
          message: 'A confirmação de e-mail ainda está ativa no Supabase. Desative essa opção para usar o login acadêmico simplificado.'
        })
      }

      return res.status(401).json({
        message: 'E-mail ou senha incorretos.'
      })
    }

    res.json({
      user: data.user,
      session: data.session
    })
  } catch (error) {
    next(error)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    if (!req.body.refreshToken) {
      return res.status(400).json({ message: 'Refresh token não informado.' })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: req.body.refreshToken
    })

    if (error) {
      return res.status(401).json({ message: 'Não foi possível renovar a sessão.' })
    }

    res.json({ user: data.user, session: data.session })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const client = createUserClient(req.accessToken)
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        ...profile
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
