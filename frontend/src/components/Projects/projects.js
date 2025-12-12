import React, { useState, useEffect, useContext } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import Sheet from "../Sheet/sheet";
import { AuthContext } from "../../context/AuthContext";
import "./projects.css"
import { Button, TextField } from '@mui/material';
import { Trash as DeleteIcon, SquareChevronLeft as BackIcon } from "lucide-react";

function Projects() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token, refreshAccessToken } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sheetData, setSheetData] = useState({});
  const [newProjectName, setNewProjectName] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  // ---------- Fetch avec refresh token ----------
  const fetchWithRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Unable to refresh token");
      res = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
      });
    }
    return res;
  };

  // ---------- Chargement liste de projets ----------
  const fetchProjects = async () => {
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/`);
      const data = await res.json();
      setProjects(data.results || []);
    } catch (error) {
      console.error("Erreur fetch projets:", error);
    }
  };

  // ---------- Chargement contenu d'un projet ----------
  const fetchProjectContent = async (projectId) => {
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/${projectId}/`);
      const data = await res.json();
      setSelectedProject(data);
      setSheetData(data.sheet_data || {});
    } catch (error) {
      console.error("Erreur fetch projet:", error);
    }
  };

  // ---------- Création de projet ----------
  const createProject = async () => {
    if (!newProjectName.trim()) return alert("Nom du projet requis !");
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, sheet_data: {} }),
      });
      const data = await res.json();
      setProjects((prev) => [...prev, data]);
      setNewProjectName("");
      navigate(`/projects/${data.id}`); // navigation directe vers le nouveau projet
    } catch (error) {
      console.error("Erreur création projet:", error);
    }
  };

  // ---------- Suppression projet ----------
  const deleteProject = async (projectId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/${projectId}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Suppression échouée");

      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setSheetData({});
        navigate("/projects");
      }
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Impossible de supprimer le projet !");
    }
  };

  // ---------- Effet pour charger projets et projet sélectionné ----------
  useEffect(() => {
    if (token) fetchProjects();
    if (id) fetchProjectContent(id);
    else {
      setSelectedProject(null);
      setSheetData({});
    }
  }, [token, id]);

  // ---------- Navigation bouton retour ----------
  const handleBackToList = () => {
    navigate("/projects");
  };

  // ---------- Affichage ----------
  const isSheetView = !!id && selectedProject;

  return (
    <div className="projects-container">
      {!isSheetView && (
        <>
          <h1>Mes projets</h1>
          <div id="create-project">
            <TextField 
              variant="standard"
              placeholder="Nom du nouveau projet"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <Button variant="contained" onClick={createProject} id="create-project-button">Créer projet</Button>
          </div>

          <table id="projects">
            {Array.isArray(projects) &&
              projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <table id="logo-sheet">
                      <tr><td></td><td></td></tr>
                      <tr><td></td><td></td></tr>
                      <tr><td></td><td></td></tr>
                    </table>
                  </td>
                  <td>
                    <button
                      id="project-name"
                      onClick={() => navigate(`/projects/${p.id}`)}
                      title={p.name}
                    >
                      {p.name}
                    </button>
                  </td>
                  <td>
                    <Button variant="outlined" startIcon={<DeleteIcon />} id="delete-project-button" onClick={() => deleteProject(p.id)}>Supprimer</Button>
                  </td>
                </tr>
              ))}
          </table>
        </>
      )}

      {isSheetView && (
        <>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={handleBackToList}>Retour aux projets</Button>
          
          <Sheet sheetData={sheetData} setSheetData={setSheetData} project={selectedProject} />
          
        </>
      )}
    </div>
  );
}

export default Projects;
