import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AnimePage from './pages/AnimePage';
import EpisodePage from './pages/EpisodePage';
import Schedule from './pages/Schedule';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import UserProfile from './pages/profile/UserProfile';
import AdminDashboard from './pages/admin/Dashboard';
import CreateAnime from './pages/admin/CreateAnime';
import AnimeList from './pages/admin/anime/AnimeList';
import EpisodeManagement from './components/admin/episodes/EpisodeManagement';
import UserManagement from './pages/admin/users/UserManagement';
import AdminRoute from './components/auth/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAnimeStore } from './store/anime';
import { storageService } from './services/storage';

export default function App() {
  const initializeStore = useAnimeStore((state) => state.initializeStore);

  useEffect(() => {
    // Initialize storage and store on app start
    storageService.initialize();
    initializeStore();
  }, [initializeStore]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/anime/:id" element={<AnimePage />} />
            <Route path="/anime/:animeId/episode/:episodeId" element={<EpisodePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
              <Route path="anime" element={<AnimeList />} />
              <Route path="anime/create" element={<CreateAnime />} />
              <Route path="episodes" element={<EpisodeManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}
