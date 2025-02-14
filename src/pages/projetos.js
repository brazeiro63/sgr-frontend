import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const API_URL = "http://192.168.0.46:8000/api/projetos";

export default function Projetos() {
  const router = useRouter();
  const [projetos, setProjetos] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [escopo, setEscopo] = useState("");
  const [perspectiva, setPerspectiva] = useState("");
  const [funcoes, setFuncoes] = useState("");
  const [restricoes, setRestricoes] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar projetos");
      const data = await response.json();
      setProjetos(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editando ? `${API_URL}/${editando}` : API_URL;
    const method = editando ? "PUT" : "POST";
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, descricao, escopo }),
      });
      if (!response.ok) throw new Error("Erro ao salvar projeto");
      setNome("");
      setDescricao("");
      setEscopo("");
      setPerspectiva(""),
      setFuncoes(""),
      setRestricoes(""),
      setEditando(null);
      carregarProjetos();
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
    }
  };

  const handleEdit = (projeto) => {
    setNome(projeto.nome);
    setDescricao(projeto.descricao);
    setEscopo(projeto.escopo);
    setPerspectiva(projeto.perspectiva);
    setFuncoes(projeto.funcoes);
    setRestricoes(projeto.restricoes);
    setEditando(projeto.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao excluir projeto");
      carregarProjetos();
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
    }
  };

  const handleSalvarProjeto = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(`${API_URL}/projetos/${projetoSelecionado}/editar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeProjeto,
          introducao,
          escopo,
          perspectiva,
          funcoes,
          restricoes,
        }),
      });
  
      if (!response.ok) throw new Error("Erro ao atualizar projeto");
  
      alert("Projeto atualizado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao atualizar projeto:", error);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Gerenciar Projetos</h1>

      <button 
        onClick={() => router.push("/dashboard")}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Voltar ao Dashboard
      </button>

      <div className="bg-gray-100 p-6 mt-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{editando ? "Editar Projeto" : "Novo Projeto"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          ></textarea>
          <textarea
            placeholder="Escopo"
            value={escopo}
            onChange={(e) => setEscopo(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          ></textarea>
          <textarea
            placeholder="Perspectiva"
            value={perspectiva}
            onChange={(e) => setPerspectiva(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          ></textarea>
          <textarea
            placeholder="Funções"
            value={funcoes}
            onChange={(e) => setFuncoes(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          ></textarea>
          <textarea
            placeholder="Restrições"
            value={restricoes}
            onChange={(e) => setRestricoes(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          ></textarea>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editando ? "Atualizar" : "Criar"}
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-semibold mt-6">Projetos Cadastrados</h2>
      {projetos.length === 0 ? (
        <p className="text-gray-500">Nenhum projeto encontrado.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {projetos.map((proj) => (
            <li key={proj.id} className="bg-white shadow p-4 rounded-lg flex justify-between">
              <div>
                <h3 className="text-lg font-bold">{proj.nome}</h3>
                <p className="text-gray-600">{proj.descricao}</p>
                <p className="text-gray-600 italic">Escopo: {proj.escopo}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(proj)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                <button onClick={() => handleDelete(proj.id)} className="bg-red-500 text-white px-2 py-1 rounded">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
