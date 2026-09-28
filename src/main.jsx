import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  DbProvider,
} from '@tanstack/react-db'

import { dbClient } from './db'
import App from './App.jsx'

createRoot(
  document.getElementById('root'),
).render(
  <StrictMode>
    <DbProvider client={dbClient}>
      <App />
    </DbProvider>
  </StrictMode>,
)