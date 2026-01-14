import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Force Tailwind to generate all custom color classes
const AllClasses = () => (
  <div className="hidden
    bg-primary text-primary-foreground
    bg-secondary text-secondary-foreground
    bg-destructive text-destructive-foreground
    bg-muted text-muted-foreground
    bg-accent text-accent-foreground
    bg-popover text-popover-foreground
    bg-card text-card-foreground
    border-border
    bg-background text-foreground
    hover:bg-primary/90 hover:bg-secondary/80
    focus-visible:ring-ring ring-offset-background
  " />
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <AllClasses />
      <App />
    </>
  </React.StrictMode>,
)
