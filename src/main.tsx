import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RecoveryBoundary } from './components/RecoveryBoundary'
import './mobile.css'
import './premium.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoveryBoundary><App /></RecoveryBoundary>
  </React.StrictMode>,
)
