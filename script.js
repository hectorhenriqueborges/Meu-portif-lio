// 1. Pegar os elementos da página
const campoTarefa = document.getElementById("campo-tarefa");
const campoPrioridade = document.getElementById("campo-prioridade");
const campoData = document.getElementById("campo-data");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefas = document.getElementById("lista-tarefas");
const contador = document.getElementById("contador");
const botaoLimpar = document.getElementById("botao-limpar");
const botaoTema = document.getElementById("botao-tema");
const botoesFiltro = document.querySelectorAll(".filtro");

// 2. Dados do app
let tarefas = [];
let filtroAtual = "todas";

const nomesPrioridade = {
  alta: "Prioridade alta",
  media: "Prioridade média",
  baixa: "Prioridade baixa"
};

// 3. Salvar e carregar (localStorage)
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const dadosSalvos = localStorage.getItem("tarefas");
  if (dadosSalvos) {
    tarefas = JSON.parse(dadosSalvos);
    // Garante que tarefas antigas tenham os campos novos
    tarefas.forEach(function (tarefa) {
      if (!tarefa.prioridade) {
        tarefa.prioridade = "media";
      }
      if (!tarefa.data) {
        tarefa.data = "";
      }
    });
  }
}

// 4. Funções de apoio para datas
function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function formatarData(dataISO) {
  const partes = dataISO.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// 5. Filtro e contador
function tarefasFiltradas() {
  return tarefas.filter(function (tarefa) {
    if (filtroAtual === "pendentes") {
      return !tarefa.concluida;
    }
    if (filtroAtual === "concluidas") {
      return tarefa.concluida;
    }
    return true;
  });
}

function atualizarContador() {
  const pendentes = tarefas.filter(function (tarefa) {
    return !tarefa.concluida;
  }).length;

  contador.textContent = pendentes === 1 ? "1 pendente" : pendentes + " pendentes";
}

// 6. Editar o texto de uma tarefa (duplo clique)
function editarTarefa(tarefa, spanTexto) {
  const campoEdicao = document.createElement("input");
  campoEdicao.type = "text";
  campoEdicao.value = tarefa.texto;
  campoEdicao.classList.add("campo-edicao");

  spanTexto.replaceWith(campoEdicao);
  campoEdicao.focus();

  let finalizada = false;

  function confirmar() {
    if (finalizada) {
      return;
    }
    finalizada = true;

    const novoTexto = campoEdicao.value.trim();
    if (novoTexto !== "") {
      tarefa.texto = novoTexto;
    }
    salvarTarefas();
    mostrarTarefas();
  }

  campoEdicao.addEventListener("blur", confirmar);
  campoEdicao.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
      campoEdicao.blur();
    }
    if (evento.key === "Escape") {
      campoEdicao.value = tarefa.texto;
      campoEdicao.blur();
    }
  });
}

// 7. Desenhar as tarefas na tela
function mostrarTarefas() {
  listaTarefas.innerHTML = "";

  const visiveis = tarefasFiltradas();

  if (visiveis.length === 0) {
    const vazio = document.createElement("li");
    vazio.classList.add("vazio");
    vazio.textContent = "Nenhuma tarefa por aqui.";
    listaTarefas.appendChild(vazio);
  }

  visiveis.forEach(function (tarefa) {
    const item = document.createElement("li");
    item.classList.add("prioridade-" + tarefa.prioridade);
    if (tarefa.concluida) {
      item.classList.add("concluida");
    }

    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.checked = tarefa.concluida;
    caixa.addEventListener("change", function () {
      tarefa.concluida = caixa.checked;
      salvarTarefas();
      mostrarTarefas();
    });

    const conteudo = document.createElement("div");
    conteudo.classList.add("conteudo");

    const spanTexto = document.createElement("span");
    spanTexto.textContent = tarefa.texto;
    spanTexto.title = "Duplo clique para editar";
    spanTexto.addEventListener("dblclick", function () {
      editarTarefa(tarefa, spanTexto);
    });

    const detalhes = document.createElement("small");
    let textoDetalhes = nomesPrioridade[tarefa.prioridade];

    if (tarefa.data) {
      textoDetalhes += " • 📅 " + formatarData(tarefa.data);
      if (!tarefa.concluida && tarefa.data < hojeISO()) {
        detalhes.classList.add("atrasada");
        textoDetalhes += " (atrasada)";
      }
    }
    detalhes.textContent = textoDetalhes;

    conteudo.appendChild(spanTexto);
    conteudo.appendChild(detalhes);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "✕";
    botaoExcluir.classList.add("botao-excluir");
    botaoExcluir.addEventListener("click", function () {
      const posicao = tarefas.indexOf(tarefa);
      tarefas.splice(posicao, 1);
      salvarTarefas();
      mostrarTarefas();
    });

    item.appendChild(caixa);
    item.appendChild(conteudo);
    item.appendChild(botaoExcluir);
    listaTarefas.appendChild(item);
  });

  atualizarContador();
}

// 8. Adicionar uma tarefa nova
function adicionarTarefa() {
  const texto = campoTarefa.value.trim();

  if (texto === "") {
    return;
  }

  tarefas.push({
    texto: texto,
    concluida: false,
    prioridade: campoPrioridade.value,
    data: campoData.value
  });

  salvarTarefas();
  mostrarTarefas();

  campoTarefa.value = "";
  campoData.value = "";
  campoTarefa.focus();
}

// 9. Limpar tarefas concluídas
botaoLimpar.addEventListener("click", function () {
  const quantidade = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;

  if (quantidade === 0) {
    return;
  }

  if (confirm("Remover " + quantidade + " tarefa(s) concluída(s)?")) {
    tarefas = tarefas.filter(function (tarefa) {
      return !tarefa.concluida;
    });
    salvarTarefas();
    mostrarTarefas();
  }
});

// 10. Filtros
botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    filtroAtual = botao.dataset.filtro;

    botoesFiltro.forEach(function (outro) {
      outro.classList.remove("ativo");
    });
    botao.classList.add("ativo");

    mostrarTarefas();
  });
});

// 11. Modo escuro
function aplicarTema(escuro) {
  document.body.classList.toggle("escuro", escuro);
  botaoTema.textContent = escuro ? "☀️" : "🌙";
}

botaoTema.addEventListener("click", function () {
  const escuro = !document.body.classList.contains("escuro");
  aplicarTema(escuro);
  localStorage.setItem("tema", escuro ? "escuro" : "claro");
});

// 12. Eventos de adicionar
botaoAdicionar.addEventListener("click", adicionarTarefa);

campoTarefa.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    adicionarTarefa();
  }
});

// 13. Ao abrir a página
aplicarTema(localStorage.getItem("tema") === "escuro");
carregarTarefas();
mostrarTarefas();