import React, { useState, useContext } from 'react';
import "./login.css";
import { Button, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            login(data.access, data.refresh);
            setTimeout(() => {
                navigate('/projects');
            }, 1000);
        } else {
            const incorrectElement = document.getElementsByClassName('incorrectIds')[0];
            incorrectElement.classList.toggle('hide');
            console.error('Login failed', data);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setResetMessage('Veuillez entrer votre email.');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/password-reset/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                setResetMessage('Un email de réinitialisation a été envoyé.');
            } else {
                setResetMessage('Impossible d’envoyer l’email. Vérifiez votre email.');
            }
        } catch (err) {
            console.error(err);
            setResetMessage('Erreur serveur, réessayez plus tard.');
        }
    };

    return (
        <div className="login-wrapper">
            <h1>Connexion</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <TextField id="e-mail" label="e-mail" variant="standard" onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <TextField
                        id="password"
                        label="password"
                        variant="standard"
                        onChange={e => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
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
                            )
                        }}
                    />
                </div>
                <div className="incorrectIds hide" style={{ color: 'red' }}>Identifiants incorrects</div>

                <button className="forgotten-password" type="button" onClick={handlePasswordReset}>
                    Mot de passe oublié ?
                </button>
                {resetMessage && <div style={{ color: 'green', marginTop: 5 }}>{resetMessage}</div>}

                <div style={{ marginTop: 20 }}>
                    <Button className='login' variant="contained" type="submit">Se connecter</Button>
                </div>
                <Link className="no-account" to={'/signup'}>Pas de compte ?</Link>
            </form>
        </div>
    );
}

export default Login;
