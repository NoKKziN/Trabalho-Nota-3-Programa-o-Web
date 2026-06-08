export function notFound(req, res) {
  void req
  res.status(404).json({ message: 'Rota não encontrada.' })
}

export function errorHandler(error, req, res, next) {
  void req
  console.error(error)

  if (res.headersSent) {
    return next(error)
  }

  res.status(error.status || 500).json({
    message: error.message || 'Erro interno do servidor.'
  })
}
