import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../Api'; // Central de serviços para chamadas à VM
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegação programática

  /**
   * handleLogin: Gerencia a autenticação junto ao servidor.
   * Implementa o fluxo assíncrono e tratamento de exceções de rede.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Impede o reload padrão do formulário
    setLoading(true);

    try {
      // Chamada à API centralizada, enviando payload de credenciais
      // Nota: 'senha' é o nome esperado pelo backend no seu objeto de integração
      const response = await api.login({ email, password });

      if (response.ok) {
        // Sucesso: Redireciona para o painel de gestão de usuários
        console.log("Login autorizado pelo servidor.");
        navigate('/usuarios'); 
      } else {
        // Erro lógico: Credenciais não coincidem no banco de dados
        alert("Credenciais inválidas. Verifique os dados.");
      }
    } catch (error) {
      // Erro de infraestrutura: Servidor ou VM inacessíveis
      console.error("Erro de conexão com a infraestrutura:", error);
      alert("Não foi possível conectar ao servidor na VM.");
      
      /** * NOTA DE DESENVOLVIMENTO:
       * Em ambiente de teste, você pode descomentar a linha abaixo para navegar 
       * sem depender do servidor estar online.
       */
       // navigate('/usuarios');
    } finally {
      // Libera os campos de input e o botão para nova tentativa
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Acesso Restrito</h2>
        
        <form onSubmit={handleLogin}>
          {/* Campo de Usuário/E-mail */}
          <div className={styles.field}>
            <label>Usuário (E-mail)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading}
              className={styles.input}
            />
          </div>

          {/* Campo de Senha */}
          <div className={styles.field}>
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
              className={styles.input}
            />
          </div>

          {/* Botão de Ação Principal */}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Autenticando...' : 'Autenticar'}
          </button>

          {/* Botão Secundário para Fluxo de Cadastro (UX) */}
          <button 
            type="button" 
            className={styles.secondaryButton} 
            onClick={() => navigate('/cadastro')}
            disabled={loading}
          >
            Não tem conta? Cadastre-se
          </button>
        </form>
      </div>
    </div>
  );
}
