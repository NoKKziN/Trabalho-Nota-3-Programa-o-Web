const transactionTypes = new Set(['income', 'expense'])

export function validateEmail(email) {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

export function validateCredentials(body, requireName = false) {
  const errors = []

  if (requireName && (!body.name || body.name.trim().length < 3)) {
    errors.push('O nome deve ter pelo menos 3 caracteres.')
  }

  if (!validateEmail(body.email)) {
    errors.push('Informe um e-mail válido.')
  }

  if (!body.password || body.password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres.')
  }

  return errors
}

export function validateCategory(body) {
  const errors = []

  if (!body.name || body.name.trim().length < 2) {
    errors.push('O nome da categoria deve ter pelo menos 2 caracteres.')
  }

  if (body.color && !/^#[0-9a-f]{6}$/i.test(body.color)) {
    errors.push('A cor da categoria é inválida.')
  }

  return errors
}

export function validateTransaction(body) {
  const errors = []
  const amount = Number(body.amount)

  if (!body.description || body.description.trim().length < 2) {
    errors.push('A descrição deve ter pelo menos 2 caracteres.')
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('O valor deve ser maior que zero.')
  }

  if (!transactionTypes.has(body.type)) {
    errors.push('O tipo da transação é inválido.')
  }

  if (!body.transaction_date || Number.isNaN(Date.parse(`${body.transaction_date}T00:00:00`))) {
    errors.push('Informe uma data válida.')
  }

  return errors
}
