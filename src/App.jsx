import { useState } from 'react'
import {
  eq,
  useLiveQuery,
} from '@tanstack/react-db'

import {
  todosCollection,
  usersCollection,
} from './collections'

function App() {
  const [title, setTitle] = useState('')
  const [userId, setUserId] = useState(1)

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState(1)

  const [
    failNextComplete,
    setFailNextComplete,
  ] = useState(false)

  // ユーザー一覧
  const { data: users = [] } =
    useLiveQuery({
      query: (q) =>
        q.from({
          user: usersCollection,
        }),
    })

  // 全Todo一覧
  const {
    data: todos = [],
    isLoading,
  } = useLiveQuery({
    query: (q) =>
      q
        .from({
          todo: todosCollection,
        })
        .where(({ todo }) =>
          eq(todo.completed, false),
        ),
  })

  // 選択したユーザーのTodo一覧
  // 同じtodosCollectionを別の条件で参照
  const { data: userTodos = [] } =
    useLiveQuery({
      query: (q) =>
        q
          .from({
            todo: todosCollection,
          })
          .where(({ todo }) =>
            eq(
              todo.userId,
              selectedUserId,
            ),
          )
          .where(({ todo }) =>
            eq(todo.completed, false),
          ),
    })

  const addTodo = (event) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    todosCollection.insert({
      id: Date.now(),
      title,
      userId: Number(userId),
      completed: false,
    })

    setTitle('')
  }

  const completeTodo = (id) => {
    todosCollection.update(
      id,
      (draft) => {
        draft.completed = true
      },
    )

    setFailNextComplete(false)
  }

  const enableFailNextComplete =
    async () => {
      const response = await fetch(
        '/api/debug/fail-next-update',
        {
          method: 'POST',
        },
      )

      if (!response.ok) {
        throw new Error(
          'Failed to enable rollback demo',
        )
      }

      setFailNextComplete(true)
    }

  const selectedUser = users.find(
    (user) =>
      user.id === selectedUserId,
  )

  if (isLoading) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <h1>TanStack DB Demo</h1>

      <h2>Todo追加</h2>

      <form onSubmit={addTodo}>
        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Todo"
        />

        <select
          value={userId}
          onChange={(event) =>
            setUserId(
              Number(event.target.value),
            )
          }
        >
          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name}
            </option>
          ))}
        </select>

        <button type="submit">
          追加
        </button>
      </form>

      <hr />

      <h2>Todo一覧</h2>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title}

            {' '}

            <button
              onClick={() =>
                completeTodo(todo.id)
              }
            >
              完了
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>ユーザーごとのTodo</h2>

      <select
        value={selectedUserId}
        onChange={(event) =>
          setSelectedUserId(
            Number(event.target.value),
          )
        }
      >
        {users.map((user) => (
          <option
            key={user.id}
            value={user.id}
          >
            {user.name}
          </option>
        ))}
      </select>

      <h3>
        {selectedUser?.name}
        さんのTodo
      </h3>

      <ul>
        {userTodos.map((todo) => (
          <li key={todo.id}>
            {todo.title}

            {' '}

            <button
              onClick={() =>
                completeTodo(todo.id)
              }
            >
              完了
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>Rollbackデモ</h2>

      <button
        onClick={
          enableFailNextComplete
        }
        disabled={failNextComplete}
      >
        {failNextComplete
          ? '次の完了処理は失敗します'
          : '次の完了処理を失敗させる'}
      </button>
    </main>
  )
}

export default App