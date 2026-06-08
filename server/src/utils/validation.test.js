import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateCategory,
  validateCredentials,
  validateEmail,
  validateTransaction
} from './validation.js'

test('valida o formato de e-mail', () => {
  assert.equal(validateEmail('usuario@teste.com'), true)
  assert.equal(validateEmail('email-invalido'), false)
})

test('aceita credenciais válidas', () => {
  assert.deepEqual(validateCredentials({
    email: 'usuario@teste.com',
    password: '123456'
  }), [])
})

test('rejeita cadastro com dados inválidos', () => {
  const errors = validateCredentials({
    name: 'A',
    email: 'email-invalido',
    password: '123'
  }, true)

  assert.equal(errors.length, 3)
})

test('valida categoria e cor hexadecimal', () => {
  assert.deepEqual(validateCategory({ name: 'Mercado', color: '#00b894' }), [])
  assert.equal(validateCategory({ name: 'A', color: 'verde' }).length, 2)
})

test('aceita uma transação completa', () => {
  assert.deepEqual(validateTransaction({
    description: 'Salário',
    amount: 3500,
    type: 'income',
    transaction_date: '2026-06-07'
  }), [])
})

test('rejeita valor, tipo e data inválidos', () => {
  const errors = validateTransaction({
    description: '',
    amount: -10,
    type: 'other',
    transaction_date: 'data'
  })

  assert.equal(errors.length, 4)
})
