import { config } from 'dotenv'
import OpenAI from 'openai'
import readline from 'readline'
import axios from 'axios'

config()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const SERVER_URL = 'http://localhost:3001/api/log'

async function sendLog(entry) {
  try {
    const res = await axios.post(SERVER_URL, entry)
    if (res.data && res.data.status === 'ok') {
      console.log('✅ Лог успешно отправлен на сервер')
    } else {
      console.log('⚠️ Не удалось отправить лог на сервер:', res.data)
    }
  } catch (e) {
    console.error('Ошибка при отправке лога:', e.message)
  }
}

rl.question('Введите ваш промпт: ', async (prompt) => {
  try {
    const start = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })

    const end = Date.now()
    const response = completion.choices[0].message.content
    const usage = completion.usage

    const logEntry = {
      date: new Date().toISOString(),
      model: completion.model,
      prompt,
      response,
      tokens: usage.total_tokens,
      duration_sec: ((end - start) / 1000).toFixed(2)
    }

    // Отправка на сервер
    await sendLog(logEntry)

    console.log('\n--- Ответ от GPT ---\n')
    console.log(response)
    console.log('\n--- Метаданные ---')
    console.log(`Модель: ${completion.model}`)
    console.log(`Токенов: ${usage.total_tokens}`)
    console.log(`Время: ${logEntry.duration_sec} сек.`)

    rl.close()
  } catch (err) {
    console.error('Ошибка запроса:', err.message)
    rl.close()
  }
})
