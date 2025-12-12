import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./profile.css";
import Cropper from 'react-easy-crop';
import { getCroppedImage } from '../../utils/cropUtils';
import { Button, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

function Profile() {
    const { isLoggedIn, accessToken: token, refreshAccessToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newProfilePhoto, setNewProfilePhoto] = useState(null);
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0 });
    const [initialZoom, setInitialZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [originalPhoto, setOriginalPhoto] = useState(null);
    const [initialPhoto, setInitialPhoto] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPlaceholder(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);


    // ----- Fonctions -----
    const fetchWithAuth = async (method, url, data = null, isForm = false) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (!isForm) headers["Content-Type"] = "application/json";

            const response = await axios({ method, url, data, headers });
            return response;
        } catch (err) {
            if (err.response?.status === 401) {
                const newToken = await refreshAccessToken();
                if (!newToken) throw new Error("Unable to refresh token");

                const headers = { Authorization: `Bearer ${newToken}` };
                if (!isForm) headers["Content-Type"] = "application/json";

                return axios({ method, url, data, headers });
            } else {
                throw err;
            }
        }
    };

    // ----- useEffect pour récupérer le profil -----
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        fetchWithAuth("GET", `${API_URL}/profile/`)
            .then(res => {
                setUserData(res.data);
                setNewUsername(res.data.username);
                setNewEmail(res.data.email);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Impossible de récupérer les données');
                setLoading(false);
            });
    }, [isLoggedIn, navigate]);

    // ----- Vérification email en temps réel -----
    useEffect(() => {
        if (!newEmail) {
            setEmailExists(false);
            return;
        }

        const checkEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/check-email/?newEmail=${encodeURIComponent(newEmail)}`);
                const data = await response.json();
                setEmailExists(data.exists);
                setEmailError(data.exists ? "L'adresse mail existe déjà" : '');
            } catch (err) {
                console.error("Erreur vérification e-mail :", err);
            }
        };

        const delay = setTimeout(checkEmail, 500);
        return () => clearTimeout(delay);
    }, [newEmail]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError("");

        // Vérifier que les champs sont remplis
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Tous les champs sont obligatoires.");
            return;
        }

        // Vérifier que le nouveau mot de passe est différent de l'ancien
        if (newPassword === currentPassword) {
            setPasswordError("Le nouveau mot de passe doit être différent de l’actuel.");
            return;
        }

        // Vérifier la complexité du mot de passe
        const strongRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!strongRegex.test(newPassword)) {
            setPasswordError("Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.");
            return;
        }

        // Vérifier la confirmation
        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            await fetchWithAuth("POST", `${API_URL}/change-password/`, {
                current_password: currentPassword,
                new_password: newPassword,
            });

            alert("Mot de passe modifié avec succès !");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError("");
        } catch (err) {
            console.error(err);
            setPasswordError("Erreur lors de la modification du mot de passe.");
        }
    };


    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("username", newUsername || userData.username);
            formData.append("email", newEmail || userData.email);
            if (newProfilePhoto) formData.append("profile_photo", newProfilePhoto);

            const res = await fetchWithAuth("PATCH", `${API_URL}/profile/`, formData, true);

            setUserData(res.data);
            setEmailError(''); // réinitialise l'erreur
            alert("Profil mis à jour avec succès !");
        } catch (err) {
            // Si le backend renvoie une erreur sur l'email
            if (err.response?.data?.email) {
                setEmailError(err.response.data.email);
            } else {
                console.error(err);
                alert("Erreur lors de la mise à jour du profil");
            }
        }
    };

    const handleResetCrop = () => {
        setPreviewPhoto(originalPhoto);
        setCrop(initialCrop);
        setZoom(initialZoom);
        setCroppedAreaPixels(null);
    };

    const handleCancelPhoto = () => {
        setPreviewPhoto(null);
        setNewProfilePhoto(null);
        setOriginalPhoto(null);
        setCrop(initialCrop);
        setZoom(initialZoom);
        setCroppedAreaPixels(null);
    };

    const onCropComplete = (croppedArea, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleCropSave = async () => {
        if (!previewPhoto || !croppedAreaPixels) return;
        try {
            const fileName = `${newUsername || 'user'}-avatar.jpg`;
            const croppedFile = await getCroppedImage({
                imageSrc: previewPhoto,
                pixelCrop: croppedAreaPixels,
                fileName,
                outputSize: 400,
                quality: 0.9,
            });

            setNewProfilePhoto(croppedFile);
            setPreviewPhoto(URL.createObjectURL(croppedFile));
        } catch (err) {
            console.error('Erreur crop:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewPhoto(objectUrl);
        setOriginalPhoto(objectUrl);
        setNewProfilePhoto(file);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    useEffect(() => {
        if (userData?.profile_photo) {
            setInitialPhoto(`${API_URL}${userData.profile_photo}`);
        }
    }, [userData]);

    // ----- Render -----
    return (
        <div className="profile-container">
            <h1>Mon profil</h1>
            <div className="update-profil-password">
                <form onSubmit={handleSave}>
                    <div className='update-profile-photo-infos'>
                        {/* Bloc Photo */}
                        <div className='update-profile-photo'>
                            <div className="profile-photo-container">
                                {previewPhoto ? (
                                    <Cropper
                                        image={previewPhoto}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                ) : userData?.profile_photo ? (
                                    <img className='profile-photo-image' src={`${API_URL}${userData.profile_photo}`} alt="Photo de profil" />
                                ) : showPlaceholder ? (
                                    <div className="profile-placeholder-wrapper">
                                        <div className="profile-placeholder-head">
                                            <div className="profile-placeholder-eye left-eye"><div className="profile-placeholder-pupil"></div></div>
                                            <div className="profile-placeholder-eye right-eye"><div className="profile-placeholder-pupil"></div></div>
                                            <div className="profile-placeholder-nose"></div>
                                            <div className="profile-placeholder-mouth"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Chargement de la photo...</p>
                                )}

                                {previewPhoto && (
                                    <div className="cropper-buttons-container">
                                        <Button className="cropper-buttons" onClick={handleCropSave} variant="outlined">
                                            Appliquer le recadrage
                                        </Button>
                                        <Button className="cropper-buttons" onClick={handleResetCrop} variant="outlined">
                                            Reset recadrage
                                        </Button>
                                        <Button className="cropper-buttons" onClick={handleCancelPhoto} variant="outlined">
                                            Annuler changement
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <input type="file" id="avatar" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handleFileChange} />
                                <label htmlFor="avatar" className="custom-file-label">Choisir une photo</label>
                            </div>
                        </div>

                        {/* Bloc Informations */}
                        <div className="informations">
                            <h2>Mes informations</h2>
                            <TextField className="change-info" label="Nom d'utilisateur" fullWidth margin="normal" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            <TextField className="change-info" label="Email" fullWidth margin="normal" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} helperText={emailError} error={!!emailError} />
                            <Button className='update-profile-button' variant="contained" type="submit">Sauvegarder les changements</Button>
                        </div>

                    </div>
                </form>
        
                <form onSubmit={handleChangePassword}>
                    <h2>Changer mon mot de passe</h2>
                    <TextField
                        className="change-password"
                        label="Mot de passe actuel"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ), 
                        }}
                    />

                    <TextField
                        className="change-password"
                        label="Nouveau mot de passe"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <TextField
                        className="change-password"
                        label="Confirmer le nouveau mot de passe"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {passwordError && <p style={{ color: "red", marginTop: "10px" }}>{passwordError}</p>}

                    <Button
                        className="update-password-button"
                        variant="contained"
                        type="submit"
                    >
                        Modifier le mot de passe
                    </Button>
                </form>
              
            </div>
        </div>
    );
}

export default Profile;
