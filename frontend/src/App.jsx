import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Reflection from './pages/Reflection'
import Journal from './pages/Journal'
import Calm from './pages/Calm'
import Affirmations from './pages/Affirmations'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/calm" element={<Calm />} />
        <Route path="/affirmations" element={<Affirmations />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App