import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; 
import styles from './ListaUsuarios.module.css';

export default function ListaUsuarios() {
  // --- ESTADOS DO COMPONENTE ---
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Controles de Visibilidade (Modais e Painéis)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Estado do modal de Restore
  const [backupList, setBackupList] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [loadingBackups, setLoadingBackups] = useState(false);

  // Dados de Formulário e Automação
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });
  const [agendamentoData, setAgendamentoData] = useState({
    frequencia: 'diario',
    horarioInicio: '' 
  });

  // --- 1. BUSCA DE DADOS (GET) ---
  const carregarUsuarios = async () => {
    setLoading(true);
    setErro(null);
    try {
      // ✅ api.getUsuarios() já retorna o JSON parsed (via handleResponse)
      const data = await api.getUsuarios();
      
      /**
       * Backend retorna Page (Spring Pageable) com campo 'content',
       * ou um Array direto de objetos {id, name, email}.
       */
      const listaFinal = data.content || (Array.isArray(data) ? data : []);
      setUsuarios(listaFinal);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsuarios([]);
      setErro("Não foi possível carregar a lista: " + error.message);
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
      // ✅ api.cadastro() já retorna o dado parsed ou lança erro
      await api.cadastro(newUserData);
      alert("Novo membro da equipe registrado!");
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', password: '' });
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao salvar funcionário: " + error.message);
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
        // ✅ api.backupSistema() já retorna string parsed (via handleResponse)
        const message = await api.backupSistema();
        alert(message);
      } catch (error) {
        alert("Falha ao processar backup na VM.");
      }
    }
  };

  /**
   * INSTRUÇÃO BACKEND (POST /backup/schedule):
   * Recebe: { frequencia: string, horarioInicio: ISOString }
   * A VM deve agendar uma tarefa recorrente (ex: Crontab) baseada nesses dados.
   */
  const handleConfigurarAgendamento = async () => {
    if (!agendamentoData.horarioInicio) {
      alert("Selecione o momento de início no calendário.");
      return;
    }
    try {
      // ✅ Converte a hora local para UTC (ISO) antes de enviar ao backend
      const payload = {
        ...agendamentoData,
        horarioInicio: new Date(agendamentoData.horarioInicio).toISOString()
      };
      await api.agendarBackup(payload);
      alert(`Automação ativada! Próximo backup: ${new Date(agendamentoData.horarioInicio).toLocaleString()}`);
      setShowSchedule(false);
    } catch (error) {
      alert("Erro ao configurar agendador: " + error.message);
    }
  };

  const handleOpenRestore = async () => {
    setShowRestoreModal(true);
    setLoadingBackups(true);
    setSelectedBackup('');
    try {
      const list = await api.listarBackups();
      setBackupList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      setBackupList([]);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedBackup) {
      alert('Selecione um arquivo de backup primeiro.');
      return;
    }
    if (!window.confirm(`AÇÃO CRÍTICA: Confirma a restauração do backup "${selectedBackup}"?\n\nIsso vai sobrescrever os dados atuais.`)) {
      return;
    }
    try {
      const message = await api.restoreSistema(selectedBackup);
      alert(message);
      setShowRestoreModal(false);
      carregarUsuarios();
    } catch (error) {
      alert('Erro crítico durante a restauração: ' + error.message);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return <div className={styles.container}>Acessando servidor do Gran Buffet...</div>;

  return (
    <div className={styles.container}>
      {/* MENSAGEM DE ERRO */}
      {erro && (
        <div style={{ background: '#fdeded', color: '#b71c1c', padding: '12px 20px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {erro}</span>
          <button onClick={carregarUsuarios} style={{ background: '#b71c1c', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>Tentar novamente</button>
        </div>
      )}

      <header className={styles.headerSection}>
        <div>
          <h1>Equipe Gran Buffet</h1>
          <p>Painel Administrativo e Gestão de Dados</p>
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>+ Novo Staff</button>
          <button className={styles.btnBackup} onClick={() => setShowSchedule(!showSchedule)}>📅 Agendar</button>
          <button className={styles.btnBackup} onClick={handleBackup}>Backup SQL</button>
          <button className={styles.btnRestore} onClick={handleOpenRestore}>Restore</button>
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

      {/* MODAL DE RESTORE */}
      {showRestoreModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Restaurar Backup</h2>
            <p>Selecione um dos arquivos SQL gerados pelo sistema.</p>

            {loadingBackups ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8d6e63' }}>
                Carregando backups disponíveis...
              </div>
            ) : backupList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#c0392b', background: '#fdeded', borderRadius: '10px' }}>
                ⚠️ Nenhum arquivo de backup encontrado no servidor.
              </div>
            ) : (
              <div className={styles.backupListContainer}>
                {backupList.map((file) => (
                  <label
                    key={file}
                    className={`${styles.backupItem} ${selectedBackup === file ? styles.backupItemSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="backupFile"
                      value={file}
                      checked={selectedBackup === file}
                      onChange={() => setSelectedBackup(file)}
                      style={{ display: 'none' }}
                    />
                    <span className={styles.backupIcon}>{selectedBackup === file ? '◉' : '○'}</span>
                    <div className={styles.backupInfo}>
                      <span className={styles.backupFileName}>{file}</span>
                      <span className={styles.backupDate}>
                        {(() => {
                          const match = file.match(/backup_(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.sql/);
                          if (match) {
                            const [, ano, mes, dia, hora, min, seg] = match;
                            return `${dia}/${mes}/${ano} às ${hora}:${min}:${seg}`;
                          }
                          return file;
                        })()}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.btnAdd}
                onClick={handleConfirmRestore}
                disabled={!selectedBackup}
                style={!selectedBackup ? { opacity: 0.5, cursor: 'not-allowed' } : { background: '#c0392b' }}
              >
                🔄 Restaurar Selecionado
              </button>
              <button className={styles.btnCancel} onClick={() => setShowRestoreModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

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