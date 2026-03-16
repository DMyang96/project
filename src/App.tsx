import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileEdit from './pages/ProfileEdit';
import ProfileView from './pages/ProfileView';
import Matches from './pages/Matches';
import Applications from './pages/Applications';
import Invitations from './pages/Invitations';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/invitations" element={<Invitations />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
