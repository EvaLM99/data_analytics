import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/header';
import Home from './components/Home/home';
import Login from './components/Login/login';
import Sheet from './components/Sheet/sheet';
import SignUp from './components/SignUp/signup';
import LogOut from './components/LogOut/logout';
import Projects from './components/Projects/projects';
import Profile from './components/Profile/profile';
import ResetPassword from './components/ResetPassword/resetPassword';

function App() {
  
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sheet" element={<Sheet />} />
        <Route path="/logout" element={<LogOut />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Projects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;

