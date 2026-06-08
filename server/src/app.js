import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import profileRoutes from './routes/profile.js'
import transactionRoutes from './routes/transactions.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FinanSmart API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/profile', profileRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
