import Fastify from 'fastify'
import cors from '@fastify/cors'
import pkg from 'pg'
const { Pool } = pkg

// Настройки БД
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gpt_assistant',
  password: '7767bbhenov',
  port: 5432,
})

const fastify = Fastify()
await fastify.register(cors, { origin: true })

// Проверка работы
fastify.get('/', async (req, reply) => {
  return { status: 'ok', message: 'GPT Monitoring API' }
})

// Приём логов
fastify.post('/api/log', async (req, reply) => {
  const { date, model, prompt, response, tokens, duration_sec } = req.body
  await pool.query(
    'INSERT INTO logs(date, model, prompt, response, tokens, duration_sec) VALUES($1,$2,$3,$4,$5,$6)',
    [date, model, prompt, response, tokens, duration_sec]
  )
  reply.send({ status: 'ok' })
})

// Получить логи
fastify.get('/api/logs', async (req, reply) => {
  const result = await pool.query('SELECT * FROM logs ORDER BY date DESC LIMIT 100')
  reply.send(result.rows)
})

fastify.listen({ port: 3001 }, (err) => {
  if (err) throw err
  console.log('Server started on http://localhost:3001')
})
