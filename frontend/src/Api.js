// src/Api.js

const BASE_URL = "/api";

// ✅ função padrão para tratar resposta
async function handleResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    // tenta pegar erro do backend
    let message = text;

    try {
      const json = JSON.parse(text);
      message = json.message || text;
    } catch (e) {}

    throw new Error(message);
  }

  // tenta retornar JSON se possível
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export const api = {

  // ✅ LOGIN
  login: async (credentials) =>
    handleResponse(
      await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
    ),

  // ✅ LISTAR USUÁRIOS
  getUsuarios: async () =>
    handleResponse(await fetch(`${BASE_URL}/users`)),

  // ✅ CADASTRAR USUÁRIO
  cadastro: async (userData) =>
    handleResponse(
      await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      })
    ),

  // ✅ EXCLUIR USUÁRIO
  excluirUsuario: async (id) =>
    handleResponse(
      await fetch(`${BASE_URL}/users/${id}`, {
        method: "DELETE",
      })
    ),

  // ✅ BACKUP
  backupSistema: async () =>
    handleResponse(
      await fetch(`${BASE_URL}/backup`, {
        method: "POST",
      })
    ),

  // ✅ AGENDAR BACKUP
  agendarBackup: async (agendamentoData) =>
    handleResponse(
      await fetch(`${BASE_URL}/backup/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agendamentoData),
      })
    ),

  // ✅ RESTORE
  restoreSistema: async (fileName) =>
    handleResponse(
      await fetch(`${BASE_URL}/restore?fileName=${encodeURIComponent(fileName)}`, {
        method: "POST",
      })
    ),

  // ✅ LISTAR BACKUPS DISPONÍVEIS
  listarBackups: async () =>
    handleResponse(await fetch(`${BASE_URL}/backup/list`)),
};