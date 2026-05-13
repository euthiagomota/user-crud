import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; 
import { useNavigate } from 'react-router-dom';
import styles from './Cadastro.module.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  
  // Atualizado para incluir a regra de caracteres especiais
  const [checks, setChecks] = useState({ 
    length: false, 
    upper: false, 
    number: false,
    special: false 
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pwd = userData.password;
    setChecks({
      length: pwd.length >= 10, // Requisito: Mínimo de 10 caracteres
      upper: /[A-Z]/.test(pwd),  // Requisito: Letra maiúscula
      number: /[0-9]/.test(pwd), // Requisito: Numérico
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) // Requisito: Caractere especial
    });
  }, [userData.password]);

  // Validação do botão: todos os requisitos técnicos + preenchimento de campos
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
      console.log("Payload enviado para infraestrutura:", userData);
      const response = await api.cadastro(userData);
      
      if (response.ok) {
        alert("Utilizador registado no servidor com sucesso!");
        navigate('/'); 
      } else {
        alert("Erro no servidor ao realizar cadastro. Verifique as políticas de segurança.");
      }
    } catch (error) {
      console.error("Erro de conexão com a VM:", error);
      alert("Falha crítica de comunicação com a VM.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Novo Utilizador</h2>
        <form onSubmit={handleRegister}>
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

          <div className={styles.field}>
            <label>Senha</label>
            <input 
              type="password" 
              className={styles.input} 
              required 
              disabled={loading}
              value={userData.password}
              onChange={e => setUserData({...userData, password: e.target.value})} 
            />
            
            {/* Checklist de Segurança Visual */}
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
                {checks.special ? '✔' : '✖'} Pelo menos um caractere especial (!@#$)
              </p>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={!isFormValid || loading}>
            {loading ? 'Criptografando...' : 'Finalizar Registo'}
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className={styles.button} 
            style={{ backgroundColor: 'transparent', color: '#8b949e', marginTop: '10px', border: '1px solid #30363d' }}
          >
            Voltar ao Login
          </button>
        </form>
      </div>
    </div>
  );
}