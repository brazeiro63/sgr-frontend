import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_URL = "http://192.168.0.46:8000/api"; // Confirme que está correto

export default function Dashboard() {
  const router = useRouter();
  const [requisitos, setRequisitos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [historico, setHistorico] = useState({});
  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [versao, setVersao] = useState("1.0");
  const [editando, setEditando] = useState(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState(() => {
    return localStorage.getItem("projetoSelecionado") || "";
  });

  const estadosDisponiveis = ["Proposto", "Aprovado", "Rejeitado", "Implementado", "Em Produção"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => router.push("/login"));

    carregarProjetos();
    carregarRequisitos(projetoSelecionado);
  }, [router, projetoSelecionado]);

  const carregarProjetos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/projetos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar projetos");
      const data = await response.json();
      setProjetos(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  };

  const carregarRequisitos = async (projetoId) => {
    if (!projetoId) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/requisitos?projeto_id=${projetoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar requisitos");
      const data = await response.json();
      setRequisitos(data);
    } catch (error) {
      console.error("Erro ao buscar requisitos:", error);
    }
  };

  const handleProjetoSelecionado = (e) => {
    const selectedProjeto = e.target.value;
    setProjetoSelecionado(selectedProjeto);
    localStorage.setItem("projetoSelecionado", selectedProjeto);
    carregarRequisitos(selectedProjeto);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!projetoSelecionado) {
      alert("Selecione um projeto antes de criar um requisito.");
      return;
    }

    try {
      const metodo = editando ? "PUT" : "POST";
      const endpoint = editando ? `${API_URL}/requisitos/${editando}` : `${API_URL}/requisitos/`;

      const response = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descricao,
          versao,
          projeto_id: projetoSelecionado,
        }),
      });

      if (!response.ok) throw new Error(`Erro ao salvar requisito: ${response.status}`);

      setTitulo("");
      setDescricao("");
      setVersao("1.0");
      setEditando(null);
      carregarRequisitos(projetoSelecionado);
    } catch (error) {
      console.error("Erro ao salvar requisito:", error);
    }
  };

  const handleEdit = (requisito) => {
    setTitulo(requisito.titulo);
    setDescricao(requisito.descricao);
    setVersao(requisito.versao);
    setEditando(requisito.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/requisitos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao excluir requisito");

      carregarRequisitos(projetoSelecionado);
    } catch (error) {
      console.error("Erro ao excluir requisito:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name || "Usuário"}!</h1>

      {/* Seleção de Projeto */}
      <div className="mt-4">
        <label className="block text-lg font-semibold">Selecionar Projeto:</label>
        <select
          className="w-full p-2 border rounded mt-2"
          value={projetoSelecionado}
          onChange={handleProjetoSelecionado}
        >
          <option value="">Selecione um projeto</option>
          {projetos.map((proj) => (
            <option key={proj.id} value={proj.id}>{proj.nome}</option>
          ))}
        </select>
      </div>

      {/* Formulário de Requisitos */}
      <div className="bg-gray-100 p-4 mt-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">{editando ? "Editar Requisito" : "Novo Requisito"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Versão" value={versao} onChange={(e) => setVersao(e.target.value)} className="p-2 border rounded" required />
          <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="p-2 border rounded" required></textarea>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">{editando ? "Atualizar" : "Criar"}</button>
        </form>
      </div>

      {/* Lista de Requisitos */}
      <h2 className="text-xl font-semibold mt-6 text-gray-800">Requisitos do Projeto:</h2>

      {requisitos.length === 0 ? (
        <p className="text-gray-500 mt-4">Nenhum requisito cadastrado.</p>
      ) : (
      <ul className="mt-4 space-y-2">
        {requisitos.map((req) => (
          <li key={req.id} className="bg-white shadow p-4 rounded-lg flex justify-between items-center">
            <div className="flex-grow">
              {/* Título e Descrição com destaque */}
              <h3 className="text-xl font-semibold text-blue-600">{req.titulo}</h3>
              <p className="text-gray-800 text-base">{req.descricao}</p>
              
              {/* Detalhes com destaque no conteúdo */}
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">Estado: <span className="font-medium text-gray-800">{req.estado}</span></p>
                <p className="text-sm text-gray-500">Data criação: <span className="font-medium text-gray-800">{new Date(req.data_criacao).toLocaleDateString('pt-BR')}</span></p>
                <p className="text-sm text-gray-500">Versão: <span className="font-medium text-gray-800">{req.versao}</span></p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex space-x-2">
              <button onClick={() => handleEdit(req)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400">Editar</button>
              <button onClick={() => handleDelete(req.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      )}

      <div className="mt-6 flex space-x-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => router.push("/projetos")}>Gerenciar Projetos</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}>Sair</button>
      </div>
    </div>
  );
}
