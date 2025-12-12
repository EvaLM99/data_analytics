import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "axios";
import "./resetPassword.css";
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
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

    setLoading(true);
    try {
        const response = await axios.post(
            `${API_URL}/password-reset/confirm/`,
            { uid, token, password }
        );
        setMessage(response.data.message || "Mot de passe réinitialisé !");
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    } catch (error) {
        setMessage("Le lien est invalide ou expiré.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
        <h1>Nouveau mot de passe</h1>
      <form
        onSubmit={handleSubmit}
        id="resetForm"
      >
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
            className="reset"
            variant="contained"
            type="submit"
            disabled={loading}
            >
            {loading ? "Réinitialisation..." : "Réinitialiser"}
            </Button>
        </div>

        {message && <p className="text-sm text-center mt-4">{message}</p>}
      </form>
    </div>
  );
}
