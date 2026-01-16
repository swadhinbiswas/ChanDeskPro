import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Simple test component
function TestApp() {
    return (
        <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: '#6366f1' }}>🎉 ChanDesk is Loading!</h1>
            <p>If you see this, React is working!</p>
            <button style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Test Button
            </button>
        </div>
    )
}

const root = document.getElementById('root')
if (root) {
    createRoot(root).render(
        <StrictMode>
            <TestApp />
        </StrictMode>
    )
} else {
    console.error('Root element not found!')
    document.body.innerHTML = '<h1 style="color: red; padding: 20px;">ERROR: Root element not found!</h1>'
}
