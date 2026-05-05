	import React, { useState, useEffect } from 'react';
import { api } from '../../Api'; // CORRIGIDO: 'api' em minúsculo conforme o arquivo criado
import { useNavigate } from 'react-router-dom';
import styles from './Cadastro.module.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [checks, setChecks] = useState({ length: false, upper: false, number: false });
  const [loading, setLoading] = useState(false); // Adicionado para feedback visual

  
useEffect(() => {
  const pwd = userData.password;
  setChecks({
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd) 
  });
}, [userData.password]);

  const isFormValid = checks.length && checks.upper && checks.number && userData.name && userData.email;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia o estado de carregamento
    
    try {
	console.log("Payload enviado:", userData);
      // CHAMADA REAL: Enviando para a VM via nossa central de API
      const response = await api.cadastro(userData);
      
      if (response.ok) {
        alert("Utilizador registado no servidor com sucesso!");
        navigate('/'); 
      } else {
        alert("Erro no servidor ao realizar cadastro.");
      }
    } catch (error) {
      console.error("Erro de conexão com a VM:", error);
      alert("Não foi possível conectar à VM. Verifique se o servidor está rodando.");
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
	 	value={userData.name}   // ✅ FUNDAMENTAL
		onChange={e =>
    			setUserData({ ...userData, name: e.target.value })
		  }
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
	  	onChange={e =>
			setUserData({ ...userData, email: e.target.value })
  			}
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
            
            <div className={styles.policyBox}>
              <p className={checks.length ? styles.valid : styles.invalid}>
                {checks.length ? '✔' : '✖'} Mínimo de 10 caracteres
              </p>
              <p className={checks.upper ? styles.valid : styles.invalid}>
                {checks.upper ? '✔' : '✖'} Pelo menos uma letra maiúscula
              </p>
              <p className={checks.number ? styles.valid : styles.invalid}>
                {checks.number ? '✔' : '✖'} Pelo menos um número ou símbolo
              </p>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={!isFormValid || loading}>
            {loading ? 'Processando...' : 'Finalizar Registo'}
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className={styles.button} 
            style={{ backgroundColor: 'transparent', color: '#8b949e', marginTop: '10px', border: '1px solid #30363d' }}
          >
            Já tenho conta (Voltar)
          </button>
        </form>
      </div>
    </div>
  );
}
