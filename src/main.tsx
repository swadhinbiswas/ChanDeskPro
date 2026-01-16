import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx loading...')

const root = document.getElementById('root')
if (root) {
    createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
    console.log('✅ React app mounted')
} else {
    console.error('❌ Root element not found!')
}
