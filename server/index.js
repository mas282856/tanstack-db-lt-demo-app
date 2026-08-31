import express from 'express'

const app = express()
const port = 3000

app.use(express.json())

const users = [
  { id: 1, name: '田中' },
  { id: 2, name: '山田' },
  { id: 3, name: '佐藤' },
]

let todos = [
  {
    id: 1,
    title: 'LT資料を作る',
    userId: 1,
    completed: false,
  },
  {
    id: 2,
    title: 'デモコードを書く',
    userId: 2,
    completed: false,
  },
  {
    id: 3,
    title: '発表練習をする',
    userId: 1,
    completed: false,
  },
]

let shouldFailNextUpdate = false

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.get('/api/todos', (req, res) => {
  res.json(todos)
})

app.post('/api/todos', (req, res) => {
  const todo = req.body

  todos.push(todo)

  res.status(201).json(todo)
})

app.patch('/api/todos/:id', async (req, res) => {
  // Optimistic Updateを見やすくするために遅延
  await sleep(2000)

  if (shouldFailNextUpdate) {
    shouldFailNextUpdate = false

    return res.status(500).json({
      message: 'Update failed',
    })
  }

  const id = Number(req.params.id)

  const todo = todos.find(
    (todo) => todo.id === id,
  )

  if (!todo) {
    return res.status(404).json({
      message: 'Todo not found',
    })
  }

  Object.assign(todo, req.body)

  res.json(todo)
})

// 次の完了処理だけ失敗させる
app.post(
  '/api/debug/fail-next-update',
  (req, res) => {
    shouldFailNextUpdate = true

    res.json({
      message: 'Next update will fail',
    })
  },
)

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on port ${port}`)
})