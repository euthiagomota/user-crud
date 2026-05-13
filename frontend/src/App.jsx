import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login/Login';
import Cadastro from './components/Cadastro/Cadastro';
import ListaUsuarios from './components/ListaUsuarios/ListaUsuarios';
import './App.css'; 

function App() {
  return (
    <>
      {/* Barra de Navegação Padronizada */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo"> INFRA-SEC</div>
          <div className="nav-links">
            <Link to="/">Login</Link>
            <Link to="/cadastro">Cadastro</Link>
            <Link to="/usuarios" className="admin-link">Gestão (Admin)</Link>
          </div>
        </div>
      </nav>

      {/* Onde as telas (Login, Cadastro, Lista) aparecem */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/usuarios" element={<ListaUsuarios />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
