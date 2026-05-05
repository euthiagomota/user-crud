# 🛡️ Projeto Tópicos Integradores - Frontend (Segurança e Infraestrutura)

Este repositório contém a interface da aplicação desenvolvida para a disciplina de Tópicos Integradores. O foco do projeto é a implementação de um sistema de gestão de utilizadores com foco em **Segurança por Design** e **Arquitetura Cliente-Servidor**.

## 🚀 Estado do Projeto: Preparado para Integração
O frontend foi desenvolvido como uma **SPA (Single Page Application)** utilizando **React + Vite**. Atualmente, a aplicação encontra-se na fase de "Casca Estruturada", o que significa que:
* Toda a lógica de rotas e navegação está funcional.
* A camada de serviço (API) está mapeada e aguarda a conexão com o Backend na **Máquina Virtual (VM)**.
* As políticas de segurança inicial (cliente) e tratamento de erros de rede já estão implementadas.

---

## 🛠️ Tecnologias Utilizadas
* **React.js**: Biblioteca principal para a interface.
* **Vite**: Ferramenta de build e servidor de desenvolvimento de alta performance.
* **React Router DOM**: Gestão de navegação e rotas dinâmicas.
* **CSS Modules**: Estilização isolada para evitar conflitos de escopo e garantir integridade visual.

---

## 📁 Estrutura de Arquivos Críticos

* **`src/Api.js`**: Centralizador de requisições. Contém a lógica de `fetch` para Login, Cadastro, Listagem e Exclusão. Para ligar à VM, basta alterar a constante `BASE_URL`.
* **`src/components/Cadastro`**: Inclui validação em tempo real da **Política de Senha** (8+ caracteres, maiúsculas e números/símbolos).
* **`src/components/ListaUsuarios`**: Painel administrativo preparado para consumir dados dinâmicos via métodos `GET` e `DELETE`.

---

## 🔒 Implementações de Segurança (Frontend)

1.  **Política de Senha no Cliente**: Feedback visual imediato para garantir que o utilizador cumpra os requisitos mínimos antes do envio dos dados.
2.  **Proteção de Submissão**: Botões de formulário são desativados durante o processamento (`loading`) para evitar ataques de reenvio ou sobrecarga de logs no servidor.
3.  **Tratamento de Exceções**: Blocos `try/catch` em todas as chamadas de rede para gerir falhas de conexão com a infraestrutura da VM.
4.  **Sanitização de Rotas**: Uso de navegação programática para garantir fluxos lógicos de utilizador (ex: redirecionar para login após cadastro).

---

## 💻 Como Executar o Ambiente de Desenvolvimento

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/liviahelenat/topicos-integradores-frontend.git
    ```
2.  **Instalar dependências:**
    ```bash
    npm install
    ```
3.  **Iniciar o servidor:**
    ```bash
    npm run dev
    ```
    *Caso encontre erros de módulo, utilize:* `npm run dev -- --force`

---

## 🛰️ Roadmap de Integração (Próximos Passos)
1.  Configuração do ambiente de servidor na **VM**.
2.  Implementação do Backend e Banco de Dados.
3.  Configuração de **CORS** para permitir a comunicação entre o IP da VM e este Frontend.
4.  Substituição do `localhost` no ficheiro `Api.js` pelo IP oficial da infraestrutura.



