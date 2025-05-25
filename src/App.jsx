import { useState } from 'react'
import kbnLogo from './assets/logo/favicon.ico'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <img src={kbnLogo} className="logo" alt="KBN logo" />
      </div>
      <h1>KBN</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Welcome to KBN - Your Business Management Platform
        </p>
      </div>
      <p className="read-the-docs">
        Enterprise-level business management platform
      </p>
    </>
  )
}

export default App
