// Atualiza ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Elementos do modal
const btnLogin = document.getElementById("btnLogin");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");

// Abre o modal
btnLogin.addEventListener("click", () => {
  loginModal.style.display = "flex";
  loginModal.setAttribute("aria-hidden", "false");
});

// Fecha o modal
closeModal.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginModal.setAttribute("aria-hidden", "true");
});

// Fecha clicando fora
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
    loginModal.setAttribute("aria-hidden", "true");
  }
});

// Simula login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userType = document.getElementById("userType").value;
  const username = document.getElementById("username").value;
  alert(`Bem-vindo, ${username}! Tipo: ${userType}`);
  loginModal.style.display = "none";
  loginModal.setAttribute("aria-hidden", "true");
});
