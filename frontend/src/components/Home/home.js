import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import "./home.css"


function Home(){
    return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenue sur <span>Data analysis</span></h1>
        <p>Créez, visualisez et partagez vos analyses de données en toute simplicité 🚀</p>
      </header>

      <section className="home-features">
        <h2>Fonctionnalités principales</h2>
        <ul>
          <li>📊 Créez des graphiques interactifs</li>
          <li>📁 Gérez vos projets d’analyse</li>
          <li>🔐 Sécurisez vos données avec un compte personnel</li>
          <li>⚡ Visualisez vos résultats instantanément</li>
        </ul>
      </section>
    </div>
);
}

export default Home;