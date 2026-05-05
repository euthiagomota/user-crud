// src/Api.js

const BASE_URL = "/api";

export const api = {
  // LOGIN
  login: (credentials) =>
    fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),

  // LISTAR USUÁRIOS
  getUsuarios: () =>
    fetch(`${BASE_URL}/users`),

  // CADASTRAR USUÁRIO
  cadastro: (userData) =>
    fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }),
    }),

  // EXCLUIR USUÁRIO
  excluirUsuario: (id) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
    }),

  // ✅ BACKUP (ROTA CORRETA)
  backupSistema: () =>
    fetch(`${BASE_URL}/backup`, {
      method: "POST",
    }),

  // ✅ RESTORE (ROTA CORRETA COM fileName)
  restoreSistema: (fileName) =>
    fetch(`${BASE_URL}/restore?fileName=${encodeURIComponent(fileName)}`, {
      method: "POST",
    }),
};