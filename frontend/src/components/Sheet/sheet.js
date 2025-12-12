import React, { useRef, useContext, useState } from "react";
import "./sheet.css";
import Graphiques from "../Graphiques";
import { spreadsheetFunctions } from "../Formulas/formulas";
import { AuthContext } from "../../context/AuthContext";
import { Button, TextField } from '@mui/material';
import { Trash as DeleteIcon, Plus, Save, X } from "lucide-react";

function Sheet({ sheetData, setSheetData, project }) {
  const { accessToken: token, refreshAccessToken } = useContext(AuthContext);
  const NUMBER_ROWS = 20;
  const MAX_COLS = "AA";
  const clipboardRef = useRef("");
  const editModeRef = useRef(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // ---------- Génération des colonnes ----------
  function charRange(end) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberToLabel = (num) => {
      let label = "";
      while (num > 0) {
        num--;
        label = letters[num % 26] + label;
        num = Math.floor(num / 26);
      }
      return label;
    };
    const labelToNumber = (label) => {
      let num = 0;
      for (let i = 0; i < label.length; i++) {
        num = num * 26 + (label.charCodeAt(i) - 64);
      }
      return num;
    };
    const endNumber = labelToNumber(end);
    const result = [];
    for (let i = 1; i <= endNumber; i++) result.push(numberToLabel(i));
    return result;
  }

  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaValue, setFormulaValue] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, type: null, id: null });
  const [letters, setLetters] = useState(() => {
    if (sheetData && Object.keys(sheetData).length > 0) {
      // Récupère toutes les colonnes existantes dans sheetData
      const colSet = new Set(Object.keys(sheetData).map(id => id.replace(/\d+/, "")));
      const sortedCols = Array.from(colSet).sort((a, b) => {
        // Trie en ordre alphabétique "A", "B", ..., "AA", "AB"...
        const labelToNumber = (label) => {
          let num = 0;
          for (let i = 0; i < label.length; i++) {
            num = num * 26 + (label.charCodeAt(i) - 64);
          }
          return num;
        };
        return labelToNumber(a) - labelToNumber(b);
      });
      return sortedCols;
    }
    return charRange(MAX_COLS);
  });


  const [rows, setRows] = useState(() => {
    if (sheetData && Object.keys(sheetData).length > 0) {
      // Récupère toutes les colonnes existantes dans sheetData
      const rowSet = new Set(Object.keys(sheetData).map(id => parseInt(id.replace(/[A-Z]+/, ""))));
      const sortedRows = Array.from(rowSet).sort((a, b) => a-b)
      return sortedRows;
    }
    return range(1,NUMBER_ROWS);
  });



  // ---------- Sélection multiple ----------
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedRange, setSelectedRange] = useState([]);
  const [name, setName] = useState(project.name);

  

  // ---------- Générer la colonne suivante ----------
  const nextColumnLabel = (label) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let num = 0;
    for (let i = 0; i < label.length; i++) {
      num = num * 26 + (label.charCodeAt(i) - 64);
    }
    num++; // prochaine colonne
    let result = "";
    while (num > 0) {
      num--;
      result = letters[num % 26] + result;
      num = Math.floor(num / 26);
    }
    return result;
  };

  // ---------- Ajouter une colonne ----------
  const addCol = (colLetter) => {
    const colIndex = letters.indexOf(colLetter);
    if (colIndex === -1) return;

    // Nouvelle lettre pour la colonne insérée
    const newLetter = nextColumnLabel(letters[colIndex]);

    // Nouvelle liste de lettres
    const newLetters = [...letters];
    newLetters.splice(colIndex + 1, 0, newLetter);
    for (let i = colIndex + 2; i < newLetters.length; i++) {
      newLetters[i] = nextColumnLabel(newLetters[i - 1]);
    }
    // Créer un nouveau sheetData en décalant les colonnes
    const newSheetData = {};
    for (let row = 1; row <= rows.length; row++) {
      for (let i = 0; i < newLetters.length; i++) {
        let oldId;
        if (i < colIndex) {
          oldId = letters[i] + row;
        } else if (i === colIndex) {
          oldId = null; // nouvelle colonne
        } else {
          oldId = letters[i - 1] + row; // colonnes décalées
        }
        const newId = newLetters[i] + row;
        newSheetData[newId] = oldId ? sheetData[oldId] || "" : "";
      }
    }

  setLetters(newLetters);
  setSheetData(newSheetData);
  }

  const deleteCol = (colLetter) => {
    const colIndex = letters.indexOf(colLetter);
    if (colIndex === -1) return;

    const newLetters=[...letters];
    newLetters.pop()

    // Créer un nouveau sheetData en décalant les colonnes
    const newSheetData = {};
    for (let row = 1; row <= rows.length; row++) {
      for (let i = 0; i < newLetters.length; i++) {
        let oldId;
        if (i < colIndex) {
          oldId = letters[i] + row;
        } else {
          oldId = letters[i + 1] + row; // colonnes décalées
        }
        const newId = letters[i] + row;
        newSheetData[newId] = oldId ? sheetData[oldId] || "" : "";
      }
    }
    setLetters(newLetters);
    setSheetData(newSheetData);
  };

  

  const handleChangeName = e => {
    setName(e.target.value);
  }

  const handleContextMenu = (e, type, id) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      type: type,  
      id: id,
    });
  };



  // ---------- Gestion clavier ----------
  const handleKeyDown = (event, letter, number, letters) => {
    const currentCell = document.getElementById(letter + number);
    let colIndex = letters.indexOf(letter);
    let row = number;

    if ((event.ctrlKey || event.metaKey) && event.key === "c") {
      event.preventDefault();
      clipboardRef.current = currentCell?.value || "";
      navigator.clipboard.writeText(currentCell?.value || "");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "v") {
      event.preventDefault();
      navigator.clipboard
        .readText()
        .then((text) => (currentCell.value = text))
        .catch(() => (currentCell.value = clipboardRef.current));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      editModeRef.current = false;
      const nextCell = document.getElementById(letter + (number + 1));
      nextCell?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      editModeRef.current = false;
      row = event.key === "ArrowDown" ? row + 1 : row - 1;
      if (row >= 1 && row <= rows.length) {
        const nextCell = document.getElementById(letters[colIndex] + row);
        nextCell?.focus();
      }
      return;
    }

    if (!editModeRef.current && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      colIndex = event.key === "ArrowLeft" ? colIndex - 1 : colIndex + 1;
      if (colIndex >= 0 && colIndex < letters.length) {
        const nextCell = document.getElementById(letters[colIndex] + row);
        nextCell?.focus();
      }
      return;
    }

    if ((event.key === "Delete" || event.key === "Backspace") && !editModeRef.current) {
      event.preventDefault();
      selectedRange.forEach((id) => {
        const cell = document.getElementById(id);
        if (cell) cell.value = "";
        setSheetData((prev) => ({ ...prev, [id]: "" }));
      });
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      editModeRef.current = true;
      return;
    }
  };

  const handleBlur = (event) => {
    editModeRef.current = false;
    const element = event.target;
    const id = element.id;
    const value = element.value.trim();
    setSheetData((prev) => ({ ...prev, [id]: value }));

    if (value.startsWith("=")) {
      const allInputs = Array.from(document.querySelectorAll("input[id]"));
      const formula = value.slice(1);
      const result = evalFormula(formula, allInputs);
      element.value = result;
      setSheetData((prev) => ({ ...prev, [id]: result }));
    }
  };


  const handleClickOutside = () => setContextMenu({ ...contextMenu, visible: false });

  // ---------- Gestion formules ----------
  const infixToFunction = { "+": (x, y) => x + y, "-": (x, y) => x - y, "*": (x, y) => x * y, "/": (x, y) => x / y };
  const infixEval = (str, regex) => str.replace(regex, (_match, arg1, operator, arg2) => infixToFunction[operator](parseFloat(arg1), parseFloat(arg2)));
  const highPrecedence = (str) => {
    const regex = /([\d.]+)([*\/])([\d.]+)/;
    const str2 = infixEval(str, regex);
    return str === str2 ? str : highPrecedence(str2);
  };
  const applyFunction = (str) => {
    const noHigh = highPrecedence(str);
    const infix = /([\d.]+)([+-])([\d.]+)/;
    const str2 = infixEval(noHigh, infix);
    const functionCall = /([a-z0-9]*)\(([0-9., ]*)\)(?!.*\()/i;
    const toNumberList = (args) => args.split(",").map(parseFloat);
    const apply = (fn, args) => spreadsheetFunctions[fn.toLowerCase()]?.(toNumberList(args));
    return str2.replace(functionCall, (match, fn, args) =>
      spreadsheetFunctions.hasOwnProperty(fn.toLowerCase()) ? apply(fn, args) : match
    );
  };
  const evalFormula = (x, cells) => {
    const idToText = (id) => cells.find((cell) => cell.id === id)?.value || 0;
    const rangeRegex = /([A-Z]+)(\d+):([A-Z]+)(\d+)/gi;
    const rangeFromString = (num1, num2) => range(parseInt(num1), parseInt(num2));
    const elemValue = (num) => (character) => idToText(character + num);
    const addCharacters = (character1) => (character2) => (num) => charRange(character1, character2).map(elemValue(num));
    const rangeExpanded = x.replace(rangeRegex, (_match, char1, num1, char2, num2) => rangeFromString(num1, num2).map(addCharacters(char1)(char2)));
    const cellRegex = /[A-Z]+\d+/gi;
    const cellExpanded = rangeExpanded.replace(cellRegex, (match) => idToText(match.toUpperCase()) || 0);
    const functionExpanded = applyFunction(cellExpanded);
    return functionExpanded === x ? functionExpanded : evalFormula(functionExpanded, cells);
  };

  const handleChange = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    setSheetData((prev) => ({ ...prev, [id]: value }));
    if (selectedCell === id) setFormulaValue(value);
  };

  // ---------- Gestion fetch projets ----------
  const fetchWithRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Unable to refresh token");
      res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } });
    }
    return res;
  };

  const saveProject = async () => {
    if (!project) return;
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/${project.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, sheet_data: sheetData }),
      });
      if (!res.ok) throw new Error("Save project failed");
      alert("Projet sauvegardé !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde du projet");
    }
  };

  const deleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`Supprimer le projet "${project.name}" ?`)) return;
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/${project.id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete project failed");
      alert("Projet supprimé !");
      setSheetData({});
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du projet");
    }
  };

  // ---------- Sélection multiple utils ----------
  const getRangeIds = (startId, endId) => {
    if (!startId || !endId) return [];
    const startCol = startId.replace(/\d+/g, "");
    const startRow = parseInt(startId.replace(/\D+/g, ""));
    const endCol = endId.replace(/\d+/g, "");
    const endRow = parseInt(endId.replace(/\D+/g, ""));
    const colStartIndex = letters.indexOf(startCol);
    const colEndIndex = letters.indexOf(endCol);
    const rowStart = Math.min(startRow, endRow);
    const rowEnd = Math.max(startRow, endRow);
    const rangeIds = [];
    for (let i = Math.min(colStartIndex, colEndIndex); i <= Math.max(colStartIndex, colEndIndex); i++) {
      for (let r = rowStart; r <= rowEnd; r++) rangeIds.push(letters[i] + r);
    }
    return rangeIds;
  };

  const handleCellMouseDown = (id) => {
    setSelectionStart(id);
    setSelectionEnd(id);
    setSelectedRange([id]);
  };

  const handleCellMouseEnter = (id, e) => {
    if (e.buttons !== 1 || !selectionStart) return;
    setSelectionEnd(id);
    setSelectedRange(getRangeIds(selectionStart, id));
  };

  // ---------- Rendu ----------
  return (
    <div className="sheet-container">
      <input type="text" value={name} onChange={handleChangeName} id="modify-project-name" onBlur={() => {if(!name.trim()) setName(project.name)}}/>
      <div className="buttons">
        <Button variant="outlined" startIcon={<Save />} onClick={saveProject} id="save-project-button-sheet">Sauvegarder</Button>
        <Button variant="outlined" startIcon={<DeleteIcon />} onClick={deleteProject} id="delete-project-button-sheet">Supprimer</Button>
      </div>
      <div className="formula-container">
        <TextField
          id="formula"
          label="Entrer une formule"
          variant="outlined"
          multiline
          rows="2"
          value={formulaValue}
          onChange={(e) => {
            setFormulaValue(e.target.value);
            if (selectedCell) setSheetData((prev) => ({ ...prev, [selectedCell]: e.target.value }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && selectedCell) {
              e.preventDefault();
              const element = document.getElementById(selectedCell);
              if (element) { element.value = formulaValue; element.blur(); }
              const lettersOnly = selectedCell.replace(/\d+/g, "");
              const rowOnly = parseInt(selectedCell.replace(/\D+/g, ""));
              const nextCellId = lettersOnly + (rowOnly + 1);
              const nextCell = document.getElementById(nextCellId);
              if (nextCell) nextCell.focus();
            }
          }}
        />
      </div>

      <div
        id="container"
        style={{
          gridTemplateColumns: `50px repeat(${letters.length}, 200px)`,
          gridAutoRows: "30px",
        }}
      >
        <div className="corner-label"></div>
        {letters.map((letter) => (
          <div key={letter} className="column-label" onContextMenu={(e) => handleContextMenu(e, 'col', letter)}>
            {letter}
          </div>
        ))}

        {contextMenu.visible && (
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x, position: 'absolute', background: 'white', border: '1px solid gray', zIndex: 1000 }}
            onMouseLeave={handleClickOutside}
          >
            {contextMenu.type === 'col' && (
              <>
                <Button
                  onClick={() => { addCol(contextMenu.id); setContextMenu({ ...contextMenu, visible: false }); }}
                  startIcon={<Plus />}
                >
                  Ajouter colonne
                </Button>
                <Button
                  onClick={() => { deleteCol(contextMenu.id); setContextMenu({ ...contextMenu, visible: false }); }}
                  startIcon={<X />}
                >
                  Supprimer colonne
                </Button>
              </>
            )}
            {contextMenu.type === 'row' && (
              <>
                <Button
                  onClick={() => { /* Ajouter une ligne */ setContextMenu({ ...contextMenu, visible: false }); }}
                  startIcon={<Plus />}
                >
                  Ajouter ligne
                </Button>
                <Button
                  onClick={() => { /* Supprimer une ligne */ setContextMenu({ ...contextMenu, visible: false }); }}
                  startIcon={<X />}
                >
                  Supprimer ligne
                </Button>
              </>
            )}
          </div>
        )}
          

        {rows.map((number) => (
          <React.Fragment key={number}>
            <div className="row-label" onContextMenu={(e) => handleContextMenu(e, 'row', number)}>{number}</div>
            {letters.map((letter) => (
              <input
                key={letter + number}
                id={letter + number}
                className={`cell ${selectedCell === letter + number ? "selected" : ""} ${selectedRange.includes(letter + number) ? "multi-selected" : ""}`}
                value={sheetData[letter + number] || ""}
                onKeyDown={(e) => handleKeyDown(e, letter, number, letters)}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={(e) => { setSelectedCell(e.target.id); setFormulaValue(e.target.value); }}
                onMouseDown={() => handleCellMouseDown(letter + number)}
                onMouseEnter={(e) => handleCellMouseEnter(letter + number, e)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <Graphiques sheetData={sheetData} projectId={project?.id}/>
      
      
    </div>
  );
}

export default Sheet;
