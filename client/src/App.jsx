import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import FindTeammates from './pages/FindTeammates';
import MyRequests from './pages/MyRequests';
import MyTeams from './pages/MyTeams';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
        <ProtectedRoute>
       <Profile />
      </ProtectedRoute>
      }
    />
    <Route
  path="/find-teammates"
  element={
    <ProtectedRoute>
      <FindTeammates />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-requests"
  element={
    <ProtectedRoute>
      <MyRequests />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-teams"
  element={
    <ProtectedRoute>
      <MyTeams />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;
