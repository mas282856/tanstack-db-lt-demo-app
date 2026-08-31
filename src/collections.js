import { QueryClient } from '@tanstack/query-core'
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

export const queryClient = new QueryClient()

async function fetchJson(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(
      `API error: ${response.status}`,
    )
  }

  return response.json()
}

export const usersCollection = createCollection(
  queryCollectionOptions({
    id: 'users',

    queryKey: ['users'],

    queryFn: () =>
      fetchJson('/api/users'),

    queryClient,

    getKey: (user) => user.id,
  }),
)

export const todosCollection = createCollection(
  queryCollectionOptions({
    id: 'todos',

    queryKey: ['todos'],

    queryFn: () =>
      fetchJson('/api/todos'),

    queryClient,

    getKey: (todo) => todo.id,

    onInsert: async ({ transaction }) => {
      const mutation =
        transaction.mutations[0]

      await fetchJson('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          mutation.modified,
        ),
      })
    },

    onUpdate: async ({ transaction }) => {
      const mutation =
        transaction.mutations[0]

      await fetchJson(
        `/api/todos/${mutation.key}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            mutation.changes,
          ),
        },
      )
    },
  }),
)