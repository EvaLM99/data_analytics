function LogOut() {
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login'; // ou useNavigate() si tu utilises react-router
  };

  return (
    <button onClick={handleLogout}>Se déconnecter</button>
  );
}

export default LogOut;