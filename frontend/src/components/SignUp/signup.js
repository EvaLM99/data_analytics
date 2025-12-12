import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import "./signup.css";

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailExists, setEmailExists] = useState(false); // pour vérifier l'email existant
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(pwd);
  };

  // Vérifie si l'e-mail existe déjà en temps réel
  useEffect(() => {
    if (!email) {
      setEmailExists(false);
      return;
    }

    const checkEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/check-email/?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setEmailExists(data.exists); // le backend doit renvoyer { exists: true/false }
        if (data.exists) setEmailError("L'adresse mail existe déjà");
        else setEmailError('');
      } catch (err) {
        console.error("Erreur vérification e-mail :", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkEmail();
    }, 500); // petit délai pour ne pas spammer le serveur

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setEmailError('');

    if (emailExists) {
      setEmailError("L'adresse mail existe déjà");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial"
      );
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Utilisateur créé !');

        const tokenResponse = await fetch(`${API_URL}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenResponse.ok) {
          localStorage.setItem('access', tokenData.access);
          localStorage.setItem('refresh', tokenData.refresh);
          navigate('/projects');
        } else {
          console.error('Erreur récupération token', tokenData);
        }
      } else {
        // Gestion spécifique des erreurs
        if (data.email) setEmailError(data.email[0]);
        else if (data.username) setEmailError(data.username[0]);
        else console.error("Erreur lors de la création :", data);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setEmailError("Une erreur est survenue. Veuillez réessayer.");
    }
  };


  return (
    <div className="signup-wrapper">
      <h1>Inscription</h1>
      <form id="signupForm" onSubmit={handleSubmit}>
        <TextField
          id="username"
          label="Nom d'utilisateur"
          variant="standard"
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          id="email"
          label="E-mail"
          variant="standard"
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(emailError)}
          helperText={emailError}
        />
        <TextField
          id="password"
          label="Mot de passe"
          variant="standard"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(passwordError && !validatePassword(password))}
          helperText={passwordError && !validatePassword(password) ? passwordError : ''}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="confirm-password"
          label="Confirmer le mot de passe"
          variant="standard"
          fullWidth
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={password !== confirmPassword}
          helperText={password !== confirmPassword ? "Les mots de passe ne correspondent pas" : ''}
        />

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <Button
            className="signup"
            variant="contained"
            type="submit"
            disabled={!username || !email || !password || !confirmPassword || emailExists}
          >
            S'inscrire
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
