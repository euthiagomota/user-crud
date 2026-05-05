import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; 
import styles from './ListaUsuarios.module.css';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Adição (Controle de visibilidade e dados do novo usuário)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });

  /**
   * 1. BUSCA DE DADOS (GET):
   * Tenta conectar com a VM. Se falhar, carrega os dados "Mock" (fictícios) 
   * para que você possamos mostrar a interface funcionando mesmo sem o servidor ligado.
   */
  // Função para carregar usuários da API (Ajustada para Paginação/Content)
  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.getUsuarios();
      const data = await response.json();

      /**
       * Lógica de Extração:
       * 1. Se existir 'data.content', usamos ele (Padrão Spring/Backend).
       * 2. Se não existir, mas 'data' for um Array, usamos o 'data' direto.
       * 3. Caso contrário, inicializamos como array vazio para não quebrar o .map()
       */
      const listaFinal = data.content || (Array.isArray(data) ? data : []);
      
      setUsuarios(listaFinal);

      // Log para debug no console do navegador (F12) para você ver o que chegou
      console.log("Dados processados para a tabela:", listaFinal);

    } catch (error) {
      console.error("Erro ao conectar com a VM:", error);
      // Mantemos o Mock apenas para você não ficar com a tela vazia no desenvolvimento
      setUsuarios([
        { id: 1, name: 'Admin (Mock)', email: 'admin@projeto.com' },
        { id: 2, name: 'Usuário (Mock)', email: 'user@projeto.com' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  /**
   * 2. GESTÃO DE INFRAESTRUTURA:
   * Funções que disparam comandos de nível de sistema na Máquina Virtual.
   */

  // Envia os dados para salvar um novo usuário no Banco de Dados real
  const handleAddUsuario = async (e) => {
    e.preventDefault();
    try {
      const response = await api.cadastro(newUserData);
      if (response.ok) {
        alert("Utilizador adicionado com sucesso à base de dados!");
        setShowAddModal(false);
        carregarUsuarios(); // Recarrega a lista para mostrar o novo usuário
      }
    } catch (error) {
      alert("Erro ao conectar com a VM para cadastrar.");
    }
  };

  // Solicita que o Backend gere um dump (snapshot) do SQL na VM
const handleBackup = async () => {
  if (window.confirm("Deseja realizar o Backup completo do banco de dados na VM?")) {
    try {
      const response = await api.backupSistema();

      if (!response.ok) {
        throw new Error("Erro no backup");
      }

      const message = await response.text(); // ✅ LÊ TEXTO
      alert(message);

    } catch (error) {
      console.error(error);
      alert("Erro ao solicitar backup para o servidor.");
    }
  }
};

  // Restaura o banco de dados. Requer confirmação por texto para evitar acidentes.
const handleRestore = async () => {
  const fileName = window.prompt(
    "AÇÃO CRÍTICA: Informe o nome do arquivo de backup (.sql) para restaurar:"
  );

  if (!fileName) return;

  try {
    const response = await api.restoreSistema(fileName);

    if (!response.ok) {
      throw new Error("Erro no restore");
    }

    const message = await response.text(); // ✅ LÊ TEXTO
    alert(message);

    carregarUsuarios(); // Atualiza a lista após restore

  } catch (error) {
    console.error(error);
    alert("Erro ao realizar restore.");
  }
};

  // Exclui um registro permanentemente via método DELETE
  const handleExcluir = async (id) => {
    if(window.confirm("Deseja excluir este usuário permanentemente?")) {
      try {
        await api.excluirUsuario(id);
        alert("Usuário removido no servidor.");
        carregarUsuarios();
      } catch (error) {
        alert("Erro ao conectar com a VM para excluir.");
      }
    }
  };

  if (loading) return <div className={styles.container}>Carregando dados da infraestrutura...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.headerSection}>
        <div>
          <h1>Gestão de Utilizadores</h1>
          <p>Painel de Controle e Auditoria de Infraestrutura</p>
        </div>
        
        {/* BOTÕES DE SISTEMA: Essenciais para os requisitos de Backup/Restore do projeto */}
        <div className={styles.actionButtons}>
          <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>+ Novo Usuário</button>
          <button className={styles.btnBackup} onClick={handleBackup}>Backup SQL</button>
          <button className={styles.btnRestore} onClick={handleRestore}>Restore</button>
        </div>
      </header>
      
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length > 0 ? (
              usuarios.map(user => (
                <tr key={user.id}>
                  <td><code>{user.id}</code></td>
                  {/* Tenta ler 'name' ou 'nome' para garantir compatibilidade com o Backend */}
                  <td>{user.name || user.nome}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className={styles.btnEdit}>Alterar</button>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => handleExcluir(user.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum usuário encontrado na VM.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE ADIÇÃO: Interface limpa para manipulação de dados via POST */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Adicionar Utilizador</h2>
            <form onSubmit={handleAddUsuario}>
              <div className={styles.field}>
                <label>Nome</label>
                <input type="text" required onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label>E-mail</label>
                <input type="email" required onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label>Senha Inicial</label>
                <input type="password" required onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnAdd}>Cadastrar</button>
                <button type="button" className={styles.btnCancel} onClick={() => setShowAddModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
