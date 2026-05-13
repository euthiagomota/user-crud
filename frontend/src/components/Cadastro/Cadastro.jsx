import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; 
import { useNavigate } from 'react-router-dom';
import styles from './Cadastro.module.css';

export default function Cadastro() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({ name: '', email: '', password: '' });

  const [checks, setChecks] = useState({ 
    length: false, 
    upper: false, 
    number: false,
    special: false 
  });

  const [loading, setLoading] = useState(false);

  // ✅ atualização das regras visuais (igual backend)
  useEffect(() => {
    const pwd = userData.password;

    setChecks({
      length: pwd.length >= 10,
      upper: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd) // ✅ alinhado com backend
    });

  }, [userData.password]);

  const isFormValid =
    checks.length &&
    checks.upper &&
    checks.number &&
    checks.special &&
    userData.name &&
    userData.email;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Payload enviado:", userData);

      // ✅ API já retorna direto ou lança erro
      const result = await api.cadastro(userData);

      alert("Utilizador registrado com sucesso!");
      navigate('/');

    } catch (error) {
      // ✅ EXIBE ERRO REAL DO BACKEND
      console.error("Erro no cadastro:", error.message);
      alert(error.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Novo Utilizador</h2>

        <form onSubmit={handleRegister}>

          {/* Nome */}
          <div className={styles.field}>
            <label>Nome Completo</label>
            <input
              type="text"
              className={styles.input}
              required
              disabled={loading}
              value={userData.name}
              onChange={e => setUserData({ ...userData, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label>E-mail</label>
            <input
              type="email"
              className={styles.input}
              required
              disabled={loading}
              value={userData.email}
              onChange={e => setUserData({ ...userData, email: e.target.value })}
            />
          </div>

          {/* Senha */}
          <div className={styles.field}>
            <label>Senha</label>
            <input 
              type="password" 
              className={styles.input} 
              required 
              disabled={loading}
              value={userData.password}
              onChange={e => setUserData({ ...userData, password: e.target.value })} 
            />

            {/* ✅ Checklist visual */}
            <div className={styles.policyBox}>
              <p className={checks.length ? styles.valid : styles.invalid}>
                {checks.length ? '✔' : '✖'} Mínimo de 10 caracteres
              </p>
              <p className={checks.upper ? styles.valid : styles.invalid}>
                {checks.upper ? '✔' : '✖'} Pelo menos uma letra maiúscula
              </p>
              <p className={checks.number ? styles.valid : styles.invalid}>
                {checks.number ? '✔' : '✖'} Pelo menos um número
              </p>
              <p className={checks.special ? styles.valid : styles.invalid}>
                {checks.special ? '✔' : '✖'} Pelo menos um caractere especial
              </p>
            </div>

          </div>

          {/* Botão */}
          <button 
            type="submit" 
            className={styles.button} 
            disabled={!isFormValid || loading}
          >
            {loading ? 'Registrando...' : 'Finalizar Registo'}
          </button>

          {/* Voltar */}
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className={styles.button}
            style={{
              backgroundColor: 'transparent',
              color: '#8b949e',
              marginTop: '10px',
              border: '1px solid #30363d'
            }}
            disabled={loading}
          >
            Voltar ao Login
          </button>

        </form>
      </div>
    </div>
  );
}