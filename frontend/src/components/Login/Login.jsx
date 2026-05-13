import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../Api';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ agora api.login já trata erros e retorna resultado direto
      const result = await api.login({ email, password });

      console.log("Login autorizado:", result);

      // ✅ sucesso → redireciona
      alert(result);
      navigate('/usuarios');

    } catch (error) {
      // ✅ AGORA MOSTRA ERRO REAL DO BACKEND
      console.error("Erro de login:", error.message);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Acesso Restrito</h2>

        <form onSubmit={handleLogin}>
          
          {/* Email */}
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

          {/* Senha */}
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

          {/* Botão */}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Autenticando...' : 'Autenticar'}
          </button>

          {/* Cadastro */}
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