//import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
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
import FlicksLeaderboard from './pages/FlicksLeaderboard.tsx';
import ReactionLeaderboard from './pages/ReactionLeaderboard.tsx';
import TracingLeaderboard from './pages/TracingLeaderboard.tsx';


function App() {
  return (
    <>
    
    {/* AuthProvider wraps everything to ensure that authentication works properly 
        Be sure to place all components but the Login component within a ProtectedRoute Component*/}
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
		    <Route path='/mode' element={<ProtectedRoute> <SelectMode /> </ProtectedRoute>} />
			  <Route path='/flicks' element={<ProtectedRoute> <FlicksGame /> </ProtectedRoute>} />
        <Route path='/trace' element={<ProtectedRoute> <TraceGame /> </ProtectedRoute>} />
        <Route path='/flicks-leaderboard' element={<ProtectedRoute> <FlicksLeaderboard /> </ProtectedRoute>} />
        <Route path='/reaction-leaderboard' element={<ProtectedRoute> <ReactionLeaderboard /> </ProtectedRoute>} />
        <Route path='/tracing-leaderboard' element={<ProtectedRoute> <TracingLeaderboard /> </ProtectedRoute>} />
        <Route path='*' element={<Navigate to="/login" replace></Navigate>} />
      </Routes>
    </AuthProvider>
	  
    </>
  )
}

export default App
