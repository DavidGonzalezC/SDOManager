// Array to store SDOs (usado en index.html)
let sdoList = JSON.parse(localStorage.getItem("sdoList")) || [];

// Login System (solo se usa en index.html)
const users = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" },
];

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleLogin();
  });
}

const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    handleLogout();
  });
}

// Carga inicial: verifica login, carga SDOs y precarga datos para edición (solo en index.html)
document.addEventListener("DOMContentLoaded", function () {
  checkLoginStatus();
  loadSDOs();
  
  // Precargar formulario en caso de edición
  if (document.getElementById("sdo-form")) {
    const editIndexStr = localStorage.getItem("editIndex");
    if (editIndexStr !== null) {
      const editIndex = parseInt(editIndexStr);
      if (sdoList[editIndex]) {
        const sdo = sdoList[editIndex];
        document.getElementById("sdo-contratista").value = sdo.contratista;
        document.getElementById("sdo-operadora").value = sdo.operadora;
        document.getElementById("sdo-contrato").value = sdo.contrato;
        document.getElementById("sdo-objeto").value = sdo.objeto;
        document.getElementById("sdo-afe").value = sdo.afe;
        document.getElementById("sdo-cc").value = sdo.cc;
        document.getElementById("sdo-valor").value = sdo.valor;
        document.getElementById("sdo-fecha").value = sdo.fecha;
      }
    }
  }
});

// SDO Form Submission (solo en index.html)
const sdoForm = document.getElementById("sdo-form");
if (sdoForm) {
  sdoForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleSDOFormSubmission();
  });
}

// Botón para copiar SDO (index.html)
const copySdoButton = document.getElementById("copy-sdo-button");
if (copySdoButton) {
  copySdoButton.addEventListener("click", function () {
    copySDOText();
  });
}

// Real-time validation for form fields (index.html)
const sdoAfeInput = document.getElementById("sdo-afe");
if (sdoAfeInput) {
  sdoAfeInput.addEventListener("input", function () {
    validateField("afe", "El campo AFE es obligatorio.");
  });
}
const sdoContratistaInput = document.getElementById("sdo-contratista");
if (sdoContratistaInput) {
  sdoContratistaInput.addEventListener("change", function () {
    validateField("contratista", "Debes seleccionar un contratista.");
  });
}
const sdoObjetoInput = document.getElementById("sdo-objeto");
if (sdoObjetoInput) {
  sdoObjetoInput.addEventListener("change", function () {
    validateField("objeto", "Debes ingresar el objeto.");
  });
}
const sdoContratoInput = document.getElementById("sdo-contrato");
if (sdoContratoInput) {
  sdoContratoInput.addEventListener("change", function () {
    validateField("contrato", "Debes ingresar el número del contrato.");
  });
}

/* ==================== Helper Functions ==================== */

// Login & Logout
function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("loggedIn", "true");
    document.getElementById("login-section").style.display = "none";
    document.getElementById("app-content").style.display = "block";
    document.getElementById("logout-button").style.display = "block";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

function handleLogout() {
  localStorage.removeItem("loggedIn");
  document.getElementById("login-section").style.display = "block";
  document.getElementById("app-content").style.display = "none";
  document.getElementById("logout-button").style.display = "none";
}

function checkLoginStatus() {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("app-content").style.display = "block";
    document.getElementById("logout-button").style.display = "block";
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("app-content").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
  }
}

// SDO Management (index.html)
function loadSDOs() {
  sdoList = JSON.parse(localStorage.getItem("sdoList")) || [];
  if (sdoList.length > 0) {
    // Muestra el último SDO creado
    agregarSDOLista(sdoList[sdoList.length - 1]);
  }
  // La variable "consecutivo" ya no se usa para la numeración global
}

function handleSDOFormSubmission() {
  hideError("contratista");
  hideError("contrato");
  hideError("objeto");
  hideError("afe");
  if (!validateForm()) return;
  showConfirmationModal();
}

function showConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.style.display = "flex";
}

function hideConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.style.display = "none";
}

// Confirmación y cancelación del modal
const confirmCreateSdoButton = document.getElementById("confirm-create-sdo");
if (confirmCreateSdoButton) {
  confirmCreateSdoButton.addEventListener("click", function () {
    hideConfirmationModal();
    const editIndexStr = localStorage.getItem("editIndex");
    if (editIndexStr !== null) {
      // Modo edición: actualiza el SDO existente
      const editIndex = parseInt(editIndexStr);
      const updatedData = createSDOObject();
      sdoList[editIndex] = updatedData;
      alert("SDO actualizado exitosamente.");
      localStorage.removeItem("editIndex");
    } else {
      // Modo creación: añade nuevo SDO
      const sdoData = createSDOObject();
      sdoList.push(sdoData);
      alert("SDO creado exitosamente.");
    }
    // En index.html se muestra la última entrada en formato tarjeta (se conserva)
    agregarSDOLista(sdoList[sdoList.length - 1]);
    saveToLocalStorage();
    document.getElementById("copy-sdo-button").style.display = "block";
    document.getElementById("sdo-form").reset();
  });
}

const cancelCreateSdoButton = document.getElementById("cancel-create-sdo");
if (cancelCreateSdoButton) {
  cancelCreateSdoButton.addEventListener("click", function () {
    hideConfirmationModal();
    alert("Creación de SDO cancelada.");
  });
}

function validateForm() {
  const fields = [
    { id: "sdo-contratista", errorId: "contratista", message: "Debes seleccionar un contratista." },
    { id: "sdo-contrato", errorId: "contrato", message: "Debes ingresar el número del contrato." },
    { id: "sdo-objeto", errorId: "objeto", message: "Debes ingresar el objeto." },
    { id: "sdo-afe", errorId: "afe", message: "Debes ingresar el AFE." },
  ];
  let isValid = true;
  fields.forEach(field => {
    const value = document.getElementById(field.id).value.trim();
    if (!value) {
      showError(field.errorId, field.message);
      isValid = false;
    }
  });
  return isValid;
}

// Calcular consecutivo individual por contratista y crear objeto SDO
function createSDOObject() {
  const contratista = document.getElementById("sdo-contratista").value.trim();
  const contractorSDOs = sdoList.filter(s => s.contratista === contratista);
  const count = contractorSDOs.length + 1;
  const consecutivoFormateado = `${contratista}-${String(count).padStart(3, "0")}`;
  return {
    consecutivo: consecutivoFormateado,
    contratista,
    operadora: document.getElementById("sdo-operadora").value.trim(),
    contrato: document.getElementById("sdo-contrato").value.trim(),
    objeto: document.getElementById("sdo-objeto").value.trim(),
    afe: document.getElementById("sdo-afe").value.trim(),
    cc: document.getElementById("sdo-cc").value.trim(),
    valor: parseFloat(document.getElementById("sdo-valor").value) || 0,
    fecha: document.getElementById("sdo-fecha").value.trim(),
  };
}

// Función para agregar SDO a la vista de index.html (vista en tarjeta)
function agregarSDOLista(sdoData) {
  const sdoListElement = document.getElementById("sdo-list");
  sdoListElement.innerHTML = "";
  const listItem = document.createElement("div");
  listItem.className = "sdo-card";
  listItem.innerHTML = `
    <span><strong>Consecutivo:</strong> ${sdoData.consecutivo}</span>
    <span><strong>Contratista:</strong> ${sdoData.contratista}</span>
    <span><strong>Operadora:</strong> ${sdoData.operadora}</span>
    <span><strong>Número del contrato:</strong> ${sdoData.contrato}</span>
    <span><strong>Objeto:</strong> ${sdoData.objeto}</span>
    <span><strong>AFE:</strong> ${sdoData.afe}</span>
    <span><strong>Cuenta Contable:</strong> ${sdoData.cc}</span>
    <span><strong>Valor:</strong> $${sdoData.valor.toLocaleString()}</span>
    <span><strong>Fecha de envío:</strong> ${sdoData.fecha}</span>
  `;
  sdoListElement.appendChild(listItem);
}

function saveToLocalStorage() {
  try {
    localStorage.setItem("sdoList", JSON.stringify(sdoList));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function hideError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  errorElement.style.display = "none";
}

function copySDOText() {
  const sdoCard = document.querySelector(".sdo-card");
  if (sdoCard) {
    const sdoText = sdoCard.textContent;
    navigator.clipboard.writeText(sdoText)
      .then(() => alert("SDO copiado al portapapeles."))
      .catch(() => alert("Error al copiar el SDO."));
  }
}

function validateField(fieldId, message) {
  const value = document.getElementById(`sdo-${fieldId}`).value.trim();
  if (!value) {
    showError(fieldId, message);
  } else {
    hideError(fieldId);
  }
}

/* ==================== Functionality for consulta.html ==================== */
if (window.location.pathname.includes("consulta.html")) {
  const sdoListConsulta = JSON.parse(localStorage.getItem("sdoList")) || [];
  
  function populateSDOList(data) {
    const sdoListElement = document.getElementById("sdo-list");
    sdoListElement.innerHTML = "";
    if (data.length === 0) {
      sdoListElement.innerHTML = "<p>No hay SDOs registrados.</p>";
      return;
    }
    // Crear la tabla
    const table = document.createElement("table");
    table.id = "sdo-table";
    
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Consecutivo</th>
        <th>Contratista</th>
        <th>Operadora</th>
        <th>Número del contrato</th>
        <th>Objeto</th>
        <th>AFE</th>
        <th>Cuenta Contable</th>
        <th>Valor</th>
        <th>Fecha de envío</th>
        <th>Acciones</th>
      </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    data.forEach((sdo) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sdo.consecutivo}</td>
        <td>${sdo.contratista}</td>
        <td>${sdo.operadora}</td>
        <td>${sdo.contrato}</td>
        <td>${sdo.objeto}</td>
        <td>${sdo.afe}</td>
        <td>${sdo.cc}</td>
        <td>$${sdo.valor.toLocaleString()}</td>
        <td>${sdo.fecha}</td>
        <td>
          <button class="edit-button" data-id="${sdo.consecutivo}">Editar</button>
          <button class="delete-button" data-id="${sdo.consecutivo}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    sdoListElement.appendChild(table);
    
    document.querySelectorAll(".edit-button").forEach(button => {
      button.addEventListener("click", () => editSDO(button.dataset.id));
    });
    document.querySelectorAll(".delete-button").forEach(button => {
      button.addEventListener("click", () => deleteSDO(button.dataset.id));
    });
  }

  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const filteredData = sdoListConsulta.filter(sdo => {
        return (
          sdo.contratista.toLowerCase().includes(searchTerm) ||
          sdo.afe.toLowerCase().includes(searchTerm)
        );
      });
      populateSDOList(filteredData);
    });
  }

  populateSDOList(sdoListConsulta);

  function editSDO(consecutivo) {
    const sdoIndex = sdoListConsulta.findIndex(sdo => sdo.consecutivo === consecutivo);
    if (sdoIndex !== -1) {
      localStorage.setItem("editIndex", sdoIndex);
      window.location.href = "index.html"; // Redirige al formulario
    }
  }

  function deleteSDO(consecutivo) {
    if (confirm("¿Estás seguro de eliminar este SDO?")) {
      const sdoIndex = sdoListConsulta.findIndex(sdo => sdo.consecutivo === consecutivo);
      if (sdoIndex !== -1) {
        sdoListConsulta.splice(sdoIndex, 1);
        localStorage.setItem("sdoList", JSON.stringify(sdoListConsulta));
        populateSDOList(sdoListConsulta);
      }
    }
  }
}

/* ==================== Sidebar Toggle ==================== */
document.addEventListener("DOMContentLoaded", function () {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarClose = document.getElementById("sidebar-close");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", openSidebar);
  }
  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }
  
  function openSidebar() {
    sidebar.style.width = "250px";
  }
  
  function closeSidebar() {
    sidebar.style.width = "0";
  }
});
