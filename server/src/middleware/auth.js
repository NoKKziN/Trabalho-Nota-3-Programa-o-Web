import { supabase } from '../config/supabase.js'

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acesso não informado.' })
  }

  const accessToken = authorization.slice(7)
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' })
  }

  req.user = data.user
  req.accessToken = accessToken
  next()
}
