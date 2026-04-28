//import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext.tsx';
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import ProtectedRoute from './ProtectedRoute';
//import app from './firebase';

//Pages
import Login from './pages/Login';
import SelectMode from './pages/Mode';
import FlicksGame from './pages/Flicks';
import TraceGame from './pages/Tracing';
import ReactionGame from './pages/Reaction';
import FlicksLeaderboard from './pages/FlicksLeaderboard.tsx';
import ReactionLeaderboard from './pages/ReactionLeaderboard.tsx';
import TracingLeaderboard from './pages/TracingLeaderboard.tsx';


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
    
    {/* AuthProvider wraps everything to ensure that authentication works properly 
        Be sure to place all components but the Login component within a ProtectedRoute Component*/}
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
		    <Route path='/mode' element={<ProtectedRoute> <SelectMode /> </ProtectedRoute>} />
			  <Route path='/flicks' element={<ProtectedRoute> <FlicksGame /> </ProtectedRoute>} />
        <Route path='/trace' element={<ProtectedRoute> <TraceGame /> </ProtectedRoute>} />
        <Route path='/reaction' element={<ProtectedRoute> <ReactionGame /> </ProtectedRoute>} />
        <Route path='/flicks-leaderboard' element={<ProtectedRoute> <FlicksLeaderboard /> </ProtectedRoute>} />
        <Route path='/reaction-leaderboard' element={<ProtectedRoute> <ReactionLeaderboard /> </ProtectedRoute>} />
        <Route path='/tracing-leaderboard' element={<ProtectedRoute> <TracingLeaderboard /> </ProtectedRoute>} />
      </Routes>
	
      <p><Link to='/login'>Test link to login page</Link></p>
	    <p><Link to='/mode'>Test link to modes page</Link></p>
    </AuthProvider>
	  
    </>
  )
}

export default App
