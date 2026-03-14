import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/Login';

function App() {
  // original part of default app code, uncomment this if also uncommenting other code
  //const [count, setCount] = useState(0)

  return (
    <>
    {/* Commented out most of default code, otherwise it shares a page with the component loaded using react router
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR <br/>
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    Temporary Link to Login page, may want to make it the default page later (path='/')
    We can add other links to the pages you are working on here too*/}
      <Link to='/login'>Test link to login page</Link>
      <Routes>
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  )
}

export default App
