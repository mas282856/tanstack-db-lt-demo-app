import {
  DbClient,
} from '@tanstack/react-db'

import {
  QueryClient,
} from '@tanstack/query-core'

export const queryClient =
  new QueryClient()

export const dbClient =
  new DbClient({
    queryClient,
  })