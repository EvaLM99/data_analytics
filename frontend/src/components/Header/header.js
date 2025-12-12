import { useNavigate } from "react-router-dom";
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import "./header.css"

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();         
    navigate("/");   
  };

  return (
    <nav>
      <h2 id="header">Data analysis</h2>
      <div>
        <a href="/">A propos</a>
        {isLoggedIn ? (
          <>
            <a href="/projects">Mes projets</a>
            
            <li><a href="/profile">Mon profil</a>
                <ul>
                    <li><button onClick={handleLogout}>Se déconnecter</button></li>
                </ul>
            </li>
          </>
        ) : (
          <div className="authentication">
            <button onClick={() => navigate("/signup")}>S'inscrire</button>
            <button onClick={() => navigate("/login")}>Se connecter</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
