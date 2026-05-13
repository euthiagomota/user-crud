import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; 
import styles from './ListaUsuarios.module.css';

export default function ListaUsuarios() {
  // --- ESTADOS DO COMPONENTE ---
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controles de Visibilidade (Modais e Painéis)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Dados de Formulário e Automação
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });
  const [agendamentoData, setAgendamentoData] = useState({
    frequencia: 'diario',
    horarioInicio: '' 
  });

  // --- 1. BUSCA DE DADOS (GET) ---
  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.getUsuarios();
      const data = await response.json();
      
      /**
       * INSTRUÇÃO BACKEND (GET /usuarios):
       * Retornar 'content' (Spring Pageable) ou Array de objetos {id, name, email}.
       */
      const listaFinal = data.content || (Array.isArray(data) ? data : []);
      setUsuarios(listaFinal);
    } catch (error) {
      console.error("Erro ao conectar com a VM:", error);
      // Mock para manter a interface funcional no dev
      setUsuarios([
        { id: 1, name: 'Gerente ', email: 'gerente@restaurante.com' },
        { id: 2, name: 'Chef de Cozinha ', email: 'chef@restaurante.com' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // --- 2. GESTÃO DE FUNCIONÁRIOS (POST / DELETE) ---
  
  const handleAddUsuario = async (e) => {
    e.preventDefault();
    try {
      const response = await api.cadastro(newUserData);
      if (response.ok) {
        alert("Novo membro da equipe registrado!");
        setShowAddModal(false);
        setNewUserData({ name: '', email: '', password: '' });
        carregarUsuarios();
      }
    } catch (error) {
      alert("Erro ao salvar funcionário na VM.");
    }
  };

  const handleExcluir = async (id) => {
    if(window.confirm("Deseja remover este funcionário permanentemente?")) {
      try {
        await api.excluirUsuario(id);
        alert("Registro removido do servidor.");
        carregarUsuarios();
      } catch (error) {
        alert("Erro ao excluir. Verifique a conexão com a VM.");
      }
    }
  };

  // --- 3. INFRAESTRUTURA E SEGURANÇA (BACKUP / RESTORE) ---

  const handleBackup = async () => {
    if (window.confirm("Gerar arquivo SQL de backup agora?")) {
      try {
        const response = await api.backupSistema();
        const message = await response.text();
        alert(message);
      } catch (error) {
        alert("Falha ao processar backup na VM.");
      }
    }
  };

  /**
   * INSTRUÇÃO BACKEND (POST /system/schedule):
   * Recebe: { frequencia: string, horarioInicio: ISOString }
   * A VM deve agendar uma tarefa recorrente (ex: Crontab) baseada nesses dados.
   */
  const handleConfigurarAgendamento = async () => {
    if (!agendamentoData.horarioInicio) {
      alert("Selecione o momento de início no calendário.");
      return;
    }
    try {
      const response = await api.agendarBackup(agendamentoData);
      if (response.ok) {
        alert(`Automação ativada! Próximo backup: ${new Date(agendamentoData.horarioInicio).toLocaleString()}`);
        setShowSchedule(false);
      }
    } catch (error) {
      alert("Erro ao configurar agendador na VM.");
    }
  };

  const handleRestore = async () => {
    const fileName = window.prompt("AÇÃO CRÍTICA: Digite o nome do arquivo .sql para restaurar:");
    if (!fileName) return;
    try {
      const response = await api.restoreSistema(fileName);
      const message = await response.text();
      alert(message);
      carregarUsuarios();
    } catch (error) {
      alert("Erro crítico durante a restauração.");
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return <div className={styles.container}>Acessando servidor do Gran Buffet...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.headerSection}>
        <div>
          <h1>Equipe Gran Buffet</h1>
          <p>Painel Administrativo e Gestão de Dados</p>
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>+ Novo Staff</button>
          <button className={styles.btnBackup} onClick={() => setShowSchedule(!showSchedule)}>📅 Agendar</button>
          <button className={styles.btnBackup} onClick={handleBackup}>Backup SQL</button>
          <button className={styles.btnRestore} onClick={handleRestore}>Restore</button>
        </div>
      </header>

      {/* PAINEL DE AGENDAMENTO (CALENDÁRIO) */}
      {showSchedule && (
        <div className={styles.agendamentoContainer} style={{ background: '#fff', borderLeft: '5px solid #e67e22', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontFamily: 'Playfair Display', color: '#3e2723', marginTop: 0 }}>Planejamento de Automação</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            <div className={styles.field} style={{ margin: 0 }}>
              <label>Repetir de forma:</label>
              <select 
                className={styles.input} 
                style={{ width: 'auto' }}
                value={agendamentoData.frequencia}
                onChange={(e) => setAgendamentoData({...agendamentoData, frequencia: e.target.value})}
              >
                <option value="diario">Diária</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>

            <div className={styles.field} style={{ margin: 0 }}>
              <label>Primeiro Backup em:</label>
              <input 
                type="datetime-local" 
                className={styles.input}
                style={{ width: 'auto' }}
                value={agendamentoData.horarioInicio}
                onChange={(e) => setAgendamentoData({...agendamentoData, horarioInicio: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={styles.btnAdd} onClick={handleConfigurarAgendamento}>Ativar Rotina</button>
              <button className={styles.btnCancel} onClick={() => setShowSchedule(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* TABELA DE FUNCIONÁRIOS */}
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Colaborador</th>
              <th>E-mail</th>
              <th>Ações de Gerência</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td><code>#{user.id}</code></td>
                <td>{user.name || user.nome}</td>
                <td>{user.email}</td>
                <td>
                  <button className={styles.btnEdit}>Alterar</button>
                  <button className={styles.btnDelete} onClick={() => handleExcluir(user.id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADICIONAR NOVO STAFF */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Registrar no Staff</h2>
            <form onSubmit={handleAddUsuario}>
              <div className={styles.field}>
                <label>Nome Completo</label>
                <input type="text" required value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label>E-mail Profissional</label>
                <input type="email" required value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
              </div>
              <div className={styles.field}>
                <label>Senha Provisória</label>
                <input type="password" required value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnAdd}>Salvar</button>
                <button type="button" className={styles.btnCancel} onClick={() => setShowAddModal(false)}>Fechar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}