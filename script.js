// Inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, doc, deleteDoc, updateDoc, getDoc, addDoc, getDocs, query,where } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAQjGYyfondMGMzGxDSngzc9fT4wq3TfVw",
  authDomain: "comunidades-70074.firebaseapp.com",
  projectId: "comunidades-70074",
  storageBucket: "comunidades-70074.firebasestorage.app",
  messagingSenderId: "669182848884",
  appId: "1:669182848884:web:25756e17e5dab0f27e4621",
  measurementId: "G-LH6Q71JJZK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRegion(regionName) {
  try {
    // Verifica se o nome da região está vazio
    if (!regionName || regionName.trim() === "") {
      alert("Por favor, preencha o campo Região.");
      return;
    }

    // Referência à coleção "regions"
    const regionsRef = collection(db, "regions");

    // Consulta se já existe uma região com o nome fornecido
    const existingRegionQuery = query(regionsRef, where("name", "==", regionName.trim()));
    const querySnapshot = await getDocs(existingRegionQuery);

    if (!querySnapshot.empty) {
      alert("Essa comunidade já existe.");
      return;
    }

    // Adiciona a nova região
    const docRef = await addDoc(regionsRef, { name: regionName.trim() });
    alert("Região adicionada com sucesso!");
    console.log("Região adicionada com ID: ", docRef.id);

    // Recarrega a lista de regiões
    listRegions();
  } catch (error) {
    console.error("Erro ao adicionar a região: ", error);
    alert("Ocorreu um erro ao adicionar a região. Tente novamente.");
  }
}


// Função para editar a região
function editRegion(regionId, regionName) {
  const newRegionName = prompt("Digite o novo nome da região:", regionName);
  if (newRegionName) {
    // Lógica para atualizar o nome da região no banco de dados
    updateRegionName(regionId, newRegionName); // Verifique se esta função está implementada corretamente
  }
}

// Função para excluir a região
function deleteRegion(regionId, regionName) {
  const confirmDelete = confirm(`Tem certeza que deseja excluir a região "${regionName}"?`);
  if (confirmDelete) {
    // Lógica para excluir a região do banco de dados
    removeRegion(regionId); // Verifique se esta função está implementada corretamente
  }
}

// Função para listar as regiões
async function listRegions() {
  const querySnapshot = await getDocs(collection(db, "regions"));
  const regionList = document.getElementById("regionList");
  regionList.innerHTML = ""; // Limpa a lista antes de adicionar novas regiões

  // Para cada região no banco de dados
  querySnapshot.forEach(async (doc) => {
    const regionId = doc.id;
    const regionName = doc.data().name;

    // Cria o item da lista
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "align-items-center");

    // Cria o nome da região (parte principal do item)
    const regionText = document.createElement("span");
    regionText.textContent = regionName;

    // Chama a função para contar o número de pessoas na comunidade dessa região
    const peopleCount = await getPeopleCount(regionId);

    // Cria o badge para exibir a quantidade de pessoas
    const regionBadge = document.createElement("span");
    regionBadge.classList.add("badge", "bg-orange");
    regionBadge.textContent = peopleCount; // Exibe o número de pessoas

    // Cria o botão de editar com texto
    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-edit", "ms-2");

    // Substituindo o ícone FontAwesome por uma imagem
    const editIcon = document.createElement("img");
    editIcon.src = "editar.png"; // Caminho para a imagem de editar
    editIcon.alt = "Editar"; // Texto alternativo
    editIcon.style.width = "25px"; // Ajuste do tamanho da imagem
    editIcon.style.height = "25px"; // Ajuste do tamanho da imagem  

    editButton.appendChild(editIcon);

    editButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de editar dispare o evento de clique no item da lista
      editRegion(regionId, regionName);
    });

    // Cria o botão de excluir com texto
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-delete", "ms-2");
   
    const deleteIcon = document.createElement("img");
    deleteIcon.src = "excluir.png"; // Caminho para a imagem de excluir
    deleteIcon.alt = "Excluir"; // Texto alternativo
    deleteIcon.style.width = "25px"; // Ajuste do tamanho da imagem
    deleteIcon.style.height = "25px"; // Ajuste do tamanho da imagem
    
    deleteButton.appendChild(deleteIcon);


    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de excluir dispare o evento de clique no item da lista
      deleteRegion(regionId, regionName);
    });

    // Adiciona o evento de clique ao item da lista (para visualizar detalhes ou editar)
    listItem.addEventListener("click", () => onRegionClick(regionId, regionName));

    // Monta o item da lista com o nome da região, o badge e os botões
    listItem.appendChild(regionText);
    listItem.appendChild(regionBadge);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    // Adiciona o item completo à lista
    regionList.appendChild(listItem);
  });
}

// Função para atualizar o nome da região no banco de dados
async function updateRegionName(regionId, newRegionName) {
  const regionRef = doc(db, "regions", regionId);
  await updateDoc(regionRef, {
    name: newRegionName
  });
  alert("Região atualizada com sucesso!");
  listRegions(); // Recarrega a lista de regiões
}

// Função para remover a região do banco de dados
async function removeRegion(regionId) {
  const regionRef = doc(db, "regions", regionId);
  await deleteDoc(regionRef);
  alert("Região excluída com sucesso!");
  listRegions(); // Recarrega a lista de regiões
}


// Função para contar o número de pessoas na comunidade
async function getPeopleCount(regionId) {
  // Acessa as comunidades dentro da região
  const communitiesRef = collection(db, "regions", regionId, "communities");
  const communitiesSnapshot = await getDocs(communitiesRef);

  let totalPeopleCount = 0;

  // Para cada comunidade dentro da região
  for (const communityDoc of communitiesSnapshot.docs) {
    // Acessa as pessoas dentro dessa comunidade
    const peopleRef = collection(communityDoc.ref, "people");
    const peopleSnapshot = await getDocs(peopleRef);

    // Conta o número de pessoas nesta comunidade
    totalPeopleCount += peopleSnapshot.size; // Tamanho do snapshot é o número de documentos
  }

  return totalPeopleCount;
}

async function listCommunities(regionId, regionName) {
  const querySnapshot = await getDocs(collection(db, "regions", regionId, "communities"));
  const communityList = document.getElementById("communityList");
  communityList.innerHTML = ""; // Limpa a lista antes de adicionar novas comunidades

  // Atualiza o título com o nome da região selecionada
  document.getElementById("selectedRegion").textContent = `${regionName}`;

  // Para cada comunidade na região
  querySnapshot.forEach(async (doc) => {
    const communityId = doc.id;
    const communityName = doc.data().name;
    const communityStatus = doc.data().status || "não atendida"; // Verifica o status da comunidade (se não tiver, assume que não foi atendida)

    // Conta o número de pessoas na comunidade
    const peopleCount = await getPeopleCountInCommunity(regionId, communityId);

    // Cria o item da lista com o mesmo estilo das regiões
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

    // Nome da comunidade
    const communityText = document.createElement("span");
    communityText.classList.add("text-capitalize");
    communityText.textContent = communityName;

    // Cria o badge para exibir a quantidade de pessoas
    const communityBadge = document.createElement("span");
    communityBadge.classList.add("badge", "bg-orange");
    communityBadge.textContent = peopleCount;
    communityBadge.classList.add("badge-pill", "badge-primary");

    // Cria o botão de editar
    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-edit", "ms-2");

    const editIcon = document.createElement("img");
    editIcon.src = "editar.png"; // Caminho para a imagem de editar
    editIcon.alt = "Editar"; // Texto alternativo
    editIcon.style.width = "25px"; // Ajuste do tamanho da imagem
    editIcon.style.height = "25px"; // Ajuste do tamanho da imagem  

    editButton.appendChild(editIcon);

    editButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de editar dispare o evento de clique na comunidade
      editCommunity(communityId, communityName, regionId, regionName); // Passando regionId e regionName
    });

    // Cria o botão de excluir
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-delete", "ms-2");

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "excluir.png"; // Caminho para a imagem de excluir
    deleteIcon.alt = "Excluir"; // Texto alternativo
    deleteIcon.style.width = "25px"; // Ajuste do tamanho da imagem
    deleteIcon.style.height = "25px"; // Ajuste do tamanho da imagem

    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de excluir dispare o evento de clique na comunidade
      deleteCommunity(communityId, regionId, regionName); // Passando regionId e regionName
    });

    // Cria o checkbox
    const checkboxContainer = document.createElement("div");
    checkboxContainer.classList.add("d-flex", "align-items-center");
    checkboxContainer.style.paddingLeft = "10px"; // Ajuste do padding

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("form-check-input");
    checkbox.id = `checkbox-${communityId}`;
    checkbox.style.width = "25px"; // Aumentando o tamanho do checkbox
    checkbox.style.height = "25px"; // Aumentando o tamanho do checkbox

    // Define o estado inicial do checkbox de acordo com o status da comunidade
    checkbox.checked = communityStatus === "atendida";

    const label = document.createElement("label");
    label.setAttribute("for", `checkbox-${communityId}`);
    label.classList.add("ms-2");

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    // Cria o texto de status
    const statusText = document.createElement("span");
    statusText.classList.add("ms-2", "community-status");
    statusText.textContent = communityStatus === "atendida" ? "Atendida" : "Não atendida";

    // Adiciona cor ao texto de acordo com o status
    statusText.style.color = communityStatus === "atendida" ? "green" : "red";

    // Adiciona evento de mudança para atualizar o status
    checkbox.addEventListener("change", async (e) => {
      e.stopPropagation(); // Impede que o clique no checkbox dispare o evento de clique da listItem

      const newStatus = checkbox.checked ? "atendida" : "não atendida";

      // Atualiza o status da comunidade no banco de dados
      await updateDoc(doc.ref, { status: newStatus });

      // Atualiza o texto de status
      statusText.textContent = newStatus === "atendida" ? "Atendida" : "Não atendida";

      // Atualiza a cor do texto
      statusText.style.color = newStatus === "atendida" ? "green" : "red";
    });

    // Adiciona o evento de clique ao item da lista para selecionar a comunidade
    listItem.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") { // Verifica se o clique não foi no checkbox
        onCommunityClick(communityId, communityName, regionId);
      }
    });

    // Monta o item da lista
    listItem.appendChild(communityText);
    listItem.appendChild(communityBadge);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    listItem.appendChild(checkboxContainer); // Coloca o checkbox após os botões
    listItem.appendChild(statusText); // Adiciona o texto de status

    // Adiciona o item completo à lista de comunidades
    communityList.appendChild(listItem);
  });
}


// Função para editar a comunidade
function editCommunity(communityId, communityName, regionId, regionName) {
  const newCommunityName = prompt("Digite o novo nome da comunidade:", communityName);
  if (newCommunityName) {
    const communityRef = doc(db, "regions", regionId, "communities", communityId);
    updateDoc(communityRef, { name: newCommunityName })
      .then(() => {
        console.log("Comunidade atualizada!");
        listCommunities(regionId, regionName); // Atualiza a lista de comunidades
      })
      .catch((e) => {
        console.error("Erro ao atualizar comunidade: ", e);
      });
  }
}

// Função para excluir a comunidade
function deleteCommunity(communityId, regionId, regionName) {
  if (confirm("Tem certeza que deseja excluir esta comunidade?")) {
    const communityRef = doc(db, "regions", regionId, "communities", communityId);
    deleteDoc(communityRef)
      .then(() => {
        console.log("Comunidade excluída!");
        listCommunities(regionId, regionName); // Atualiza a lista de comunidades
      })
      .catch((e) => {
        console.error("Erro ao excluir comunidade: ", e);
      });
  }
}


// Função para contar o número de pessoas em uma comunidade
async function getPeopleCountInCommunity(regionId, communityId) {
  const peopleSnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));
  return peopleSnapshot.size; // Retorna o número de documentos na subcoleção "people"
}

// Função para tratar o clique em uma comunidade
function handleCommunityClick(communityId, communityName, regionId) {
  console.log(`Comunidade selecionada: ${communityName} (ID: ${communityId}, Região: ${regionId})`);
}

// Função para adicionar uma nova comunidade
async function addCommunity(regionId) {
  const communityName = prompt("Digite o nome da nova comunidade:");

  // Verifica se o nome da comunidade foi preenchido
  if (!communityName) {
    alert("O nome da comunidade é obrigatório.");
    return;
  }

  // Verifica se a comunidade já existe
  const communitiesRef = collection(db, "regions", regionId, "communities");
  const q = query(communitiesRef, where("name", "==", communityName));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    alert("Essa comunidade já está registrada na região.");
    return;
  }

  try {
    // Adiciona a comunidade se passar nas validações
    await addDoc(communitiesRef, {
      name: communityName,
    });
    console.log("Comunidade adicionada!");
    listCommunities(regionId); // Atualiza a lista de comunidades
  } catch (e) {
    console.error("Erro ao adicionar comunidade: ", e);
  }
}


// Função para quando uma região for clicada
async function onRegionClick(regionId, regionName) {
  document.getElementById("regions").style.display = "none";
  document.getElementById("communities").style.display = "block";

  await listCommunities(regionId, regionName); // Aguarda a lista de comunidades ser carregada

  // Botão para adicionar comunidade
  const btnAddCommunity = document.getElementById("btnAddCommunity");
  btnAddCommunity.onclick = () => addCommunity(regionId);

  // Voltar para a lista de regiões
  const backToRegionsButton = document.getElementById("backToRegions");
  backToRegionsButton.onclick = () => {
    document.getElementById("regions").style.display = "block";
    document.getElementById("communities").style.display = "none";
  };
}

async function addPerson(communityId, regionId) {
  const personName = prompt("Digite o nome da pessoa:");
  
  if (!personName) {
    alert("O nome é obrigatório! Por favor, preencha o nome para continuar.");
    return; // Se o nome estiver vazio, interrompe a função
  }

  let personID = prompt("Digite o CPF ou RG da pessoa:");
  
// Sem validação do CPF/RG neste momento
if (!personID) {
  alert("O CPF ou RG é obrigatório! Por favor, preencha o CPF/RG para continuar.");
  return; // Se o CPF/RG estiver vazio, interrompe a função
}

  // Verifica se o CPF/RG já está cadastrado na comunidade
  const peopleSnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));
  const existingID = peopleSnapshot.docs.some(doc => doc.data().cpf === personID || doc.data().rg === personID);
  
  if (existingID) {
    alert("Este CPF ou RG já está cadastrado na comunidade. Por favor, use outro CPF/RG.");
    return; // Se o CPF/RG já existir, interrompe a função
  }

  try {
    // Adiciona a pessoa ao banco de dados
    await addDoc(collection(db, "regions", regionId, "communities", communityId, "people"), { 
      name: personName, 
      cpf: personID 
    });
    console.log("Pessoa adicionada!");
    listPeople(communityId, regionId); // Atualiza a lista de pessoas
  } catch (e) {
    console.error("Erro ao adicionar pessoa: ", e);
  }
}

// Certifique-se de que essas funções estão fora de qualquer outra função.
async function editPerson(personId, communityId, regionId, personName) {
  const newPersonName = prompt("Digite o novo nome da pessoa:", personName);
  
  if (newPersonName && newPersonName !== personName) {
    try {
      const personRef = doc(db, "regions", regionId, "communities", communityId, "people", personId);
      await updateDoc(personRef, { name: newPersonName });
      alert("Pessoa atualizada com sucesso!");
      listPeople(communityId, regionId); // Recarrega a lista de pessoas
    } catch (e) {
      console.error("Erro ao atualizar pessoa: ", e);
      alert("Erro ao atualizar pessoa. Tente novamente.");
    }
  } else {
    alert("O nome não foi alterado ou está vazio.");
  }
}

async function deletePerson(personId, communityId, regionId, personName) {
  const confirmDelete = confirm(`Tem certeza que deseja excluir a pessoa "${personName}"?`);
  
  if (confirmDelete) {
    try {
      const personRef = doc(db, "regions", regionId, "communities", communityId, "people", personId);
      await deleteDoc(personRef);
      alert("Pessoa excluída com sucesso!");
      listPeople(communityId, regionId); // Recarrega a lista de pessoas
    } catch (e) {
      console.error("Erro ao excluir pessoa: ", e);
      alert("Erro ao excluir pessoa. Tente novamente.");
    }
  }
}

async function listPeople(communityId, regionId) {
  const querySnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));
  const peopleList = document.getElementById("peopleList");
  peopleList.innerHTML = ""; // Limpa a lista de pessoas

  querySnapshot.forEach((doc) => {
    const personData = doc.data();
    const personId = doc.id; // Aqui está o id da pessoa

    // Cria a linha da tabela para cada pessoa
    const row = document.createElement("tr");

    // Nome da pessoa
    const nameCell = document.createElement("td");

    // Cria um contêiner flexível para nome e botões
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("d-flex", "justify-content-between", "align-items-center", "w-100"); // Adicionando w-100 para garantir que ocupe toda a largura da célula

    // Adiciona o nome da pessoa
    const nameText = document.createElement("span");
    nameText.textContent = personData.name;
    nameContainer.appendChild(nameText);

    // Adiciona botões de editar e excluir dentro da célula de nome
    const nameActions = document.createElement("div");
    nameActions.classList.add("d-flex", "justify-content-end", "align-items-center"); // Ajuste para alinhar à direita

    // Botão de editar nome
    const editNameButton = document.createElement("button");
    editNameButton.classList.add("btn", "btn-edit", "ms-2");

    const editNameIcon = document.createElement("img");
    editNameIcon.src = "editar.png"; // Caminho para a imagem de editar
    editNameIcon.alt = "Editar Nome"; // Texto alternativo
    editNameIcon.style.width = "20px"; // Ajuste do tamanho da imagem
    editNameIcon.style.height = "20px"; // Ajuste do tamanho da imagem  

    editNameButton.appendChild(editNameIcon);
    editNameButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de editar dispare o evento de clique na pessoa
      editPersonName(personId, communityId, regionId, personData.name); // Passando personId, communityId, regionId e personName
    });

    // Botão de excluir nome
    const deleteNameButton = document.createElement("button");
    deleteNameButton.classList.add("btn", "btn-delete", "ms-2");

    const deleteNameIcon = document.createElement("img");
    deleteNameIcon.src = "excluir.png"; // Caminho para a imagem de excluir
    deleteNameIcon.alt = "Excluir Nome"; // Texto alternativo
    deleteNameIcon.style.width = "20px"; // Ajuste do tamanho da imagem
    deleteNameIcon.style.height = "20px"; // Ajuste do tamanho da imagem  

    deleteNameButton.appendChild(deleteNameIcon);
    deleteNameButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de excluir dispare o evento de clique na pessoa
      deletePerson(personId, communityId, regionId, personData.name); // Passando personId, communityId, regionId e personName
    });

    nameActions.appendChild(editNameButton);
    nameActions.appendChild(deleteNameButton);

    // Atribui os botões ao nome
    nameContainer.appendChild(nameActions);

    // Atribui o contêiner completo de nome e botões à célula
    nameCell.appendChild(nameContainer);

    // CPF ou RG da pessoa
    const idCell = document.createElement("td");

    // Cria um contêiner flexível para CPF e botões
    const cpfContainer = document.createElement("div");
    cpfContainer.classList.add("d-flex", "justify-content-between", "align-items-center", "w-100");

    // Adiciona o CPF da pessoa
    const cpfText = document.createElement("span");
    cpfText.textContent = personData.cpf;  // Aqui vamos exibir o CPF
    cpfContainer.appendChild(cpfText);

    // Adiciona botões de editar e excluir dentro da célula de CPF
    const cpfActions = document.createElement("div");
    cpfActions.classList.add("d-flex", "justify-content-end", "align-items-center"); // Ajuste para alinhar à direita

    // Botão de editar CPF/RG
    const editCpfButton = document.createElement("button");
    editCpfButton.classList.add("btn", "btn-edit", "ms-2");

    const editCpfIcon = document.createElement("img");
    editCpfIcon.src = "editar.png"; // Caminho para a imagem de editar
    editCpfIcon.alt = "Editar CPF/RG"; // Texto alternativo
    editCpfIcon.style.width = "20px"; // Ajuste do tamanho da imagem
    editCpfIcon.style.height = "20px"; // Ajuste do tamanho da imagem  

    editCpfButton.appendChild(editCpfIcon);
    editCpfButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de editar dispare o evento de clique na pessoa
      editPersonCpf(personId, communityId, regionId, personData.cpf); // Passando personId, communityId, regionId e personCpf
    });

    // Botão de excluir CPF/RG
    const deleteCpfButton = document.createElement("button");
    deleteCpfButton.classList.add("btn", "btn-delete", "ms-2");

    const deleteCpfIcon = document.createElement("img");
    deleteCpfIcon.src = "excluir.png"; // Caminho para a imagem de excluir
    deleteCpfIcon.alt = "Excluir CPF/RG"; // Texto alternativo
    deleteCpfIcon.style.width = "20px"; // Ajuste do tamanho da imagem
    deleteCpfIcon.style.height = "20px"; // Ajuste do tamanho da imagem  

    deleteCpfButton.appendChild(deleteCpfIcon);
    deleteCpfButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique no botão de excluir dispare o evento de clique na pessoa
      deletePerson(personId, communityId, regionId, personData.name); // Passando personId, communityId, regionId e personName
    });

    cpfActions.appendChild(editCpfButton);
    cpfActions.appendChild(deleteCpfButton);

    // Atribui os botões ao CPF
    cpfContainer.appendChild(cpfActions);

    // Atribui o contêiner completo de CPF e botões à célula
    idCell.appendChild(cpfContainer);

    // Monta a linha com as células (nome, CPF/RG e ações)
    row.appendChild(nameCell);
    row.appendChild(idCell);

    // Adiciona a linha na tabela
    peopleList.appendChild(row);
  });
}



// Função para editar o nome
function editPersonName(personId, communityId, regionId, currentName) {
  const newName = prompt("Digite o novo nome da pessoa:", currentName);
  if (newName && newName !== currentName) {
    const personRef = doc(db, "regions", regionId, "communities", communityId, "people", personId);
    updateDoc(personRef, { name: newName })
      .then(() => {
        console.log("Nome atualizado!");
        listPeople(communityId, regionId); // Atualiza a lista de pessoas
      })
      .catch((e) => {
        console.error("Erro ao atualizar nome: ", e);
      });
  }
}

// Função para editar o CPF/RG
function editPersonCpf(personId, communityId, regionId, currentCpf) {
  const newCpf = prompt("Digite o novo CPF ou RG da pessoa:", currentCpf);
  if (newCpf && newCpf !== currentCpf) {
    const personRef = doc(db, "regions", regionId, "communities", communityId, "people", personId);
    updateDoc(personRef, { cpf: newCpf })
      .then(() => {
        console.log("CPF/RG atualizado!");
        listPeople(communityId, regionId); // Atualiza a lista de pessoas
      })
      .catch((e) => {
        console.error("Erro ao atualizar CPF/RG: ", e);
      });
  }
}


// Função para editar o nome
function editName(personId, communityId, regionId, currentName) {
  const newName = prompt("Digite o novo nome da pessoa:", currentName);
  if (newName && newName !== currentName) {
    const personRef = doc(db, "regions", regionId, "communities", communityId, "people", personId);
    updateDoc(personRef, { name: newName })
      .then(() => {
        console.log("Nome atualizado!");
        listPeople(communityId, regionId); // Atualiza a lista de pessoas
      })
      .catch((e) => {
        console.error("Erro ao atualizar nome: ", e);
      });
  }
}


// Função para quando uma comunidade for clicada
async function onCommunityClick(communityId, communityName, regionId) {
  document.getElementById("communities").style.display = "none";
  document.getElementById("people").style.display = "block";

  // Atualiza o nome da comunidade na interface
  document.getElementById("selectedCommunity").textContent = communityName;

  await listPeople(communityId, regionId); // Aguarda a lista de pessoas ser carregada

  document.getElementById("btnAddPerson").addEventListener("click", () => {
    addPerson(communityId, regionId); // Passa o regionId
  });

  document.getElementById("btnDownloadPDF").addEventListener("click", () => {
    downloadPDF(communityId, regionId); // Adiciona a função de download
  });

  document.getElementById("backToCommunities").addEventListener("click", () => {
    document.getElementById("communities").style.display = "block";
    document.getElementById("people").style.display = "none";
  });
}

async function downloadPDF(communityId, regionId) {
  const { jsPDF } = window.jspdf; 
  const pdfDoc = new jsPDF();

  // Carrega os nomes da comunidade e região a partir do banco de dados
  const communityName = await getCommunityName(communityId, regionId); 
  const regionName = await getRegionName(regionId);

  // Adiciona a logo centralizada no topo da página
  const logo = await loadImage('defesa.jpeg'); 
  const pageWidth = pdfDoc.internal.pageSize.width;
  const logoWidth = 50; // Ajuste a largura da logo
  const logoHeight = 50; // Ajuste a altura da logo
  const logoX = (pageWidth - logoWidth) / 2; // Centraliza a logo
  pdfDoc.addImage(logo, 'JPEG', logoX, 10, logoWidth, logoHeight);

  // Adiciona um título ao PDF com cor e estilo
  pdfDoc.setFontSize(18);
  pdfDoc.setTextColor(0, 102, 204); // Cor do título (azul)
  pdfDoc.text("Lista de Pessoas", 10, 40);
  pdfDoc.setFontSize(12);
  pdfDoc.setTextColor(0, 0, 0); // Cor do texto normal
  pdfDoc.text(`Comunidade: ${communityName}`, 10, 50);
  pdfDoc.text(`Região: ${regionName}`, 10, 55);
  pdfDoc.line(10, 60, 200, 60); 

  // Criação da tabela com bordas azuis
  const tableStartY = 70;
  const tableWidth = 180;
  const columnWidth = tableWidth / 2;

  // Cabeçalho da tabela
  pdfDoc.setFontSize(12);
  pdfDoc.setTextColor(255, 255, 255); // Cor do texto do cabeçalho (branco)
  pdfDoc.setFillColor(0, 102, 204); // Cor de fundo do cabeçalho (azul)
  pdfDoc.rect(10, tableStartY, columnWidth, 8, 'F'); // Caixa de fundo para o título da coluna 'Nome'
  pdfDoc.text("Nome", 15, tableStartY + 6);
  pdfDoc.rect(10 + columnWidth, tableStartY, columnWidth, 8, 'F'); // Caixa de fundo para o título da coluna 'CPF'
  pdfDoc.text("CPF", 115, tableStartY + 6);

  pdfDoc.line(10, tableStartY + 8, 200, tableStartY + 8); // Linha de separação

  let y = tableStartY + 10;

  const peopleSnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));

  // Adiciona as pessoas à tabela com bordas
  peopleSnapshot.forEach((personDoc) => {
    const personData = personDoc.data();
    const personName = personData.name;
    const personCPF = personData.cpf;

    // Formatação do CPF (opcional)
    const formattedCPF = personCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    // Adiciona os dados à tabela com bordas
    pdfDoc.setTextColor(0, 0, 0); // Cor do texto das pessoas (preto)
    pdfDoc.text(personName, 15, y);
    pdfDoc.text(formattedCPF, 115, y);
    y += 10;

    // Se o conteúdo ultrapassar o limite da página, cria uma nova página
    if (y > 270) {
      pdfDoc.addPage();
      y = 10;
      pdfDoc.text("Nome", 10, 10);
      pdfDoc.text("CPF", 120, 10);
      pdfDoc.line(10, 12, 200, 12);
    }
  });

  // Adiciona o número da página
  const pageHeight = pdfDoc.internal.pageSize.height; // Obtém a altura da página corretamente
  pdfDoc.text("Página " + pdfDoc.internal.getNumberOfPages(), 150, pageHeight - 10); // Página atual

  // Salva o PDF
  pdfDoc.save("lista_de_pessoas.pdf");
}



// Função auxiliar para carregar a imagem e convertê-la para Base64
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = (error) => reject(error);
  });
}

// Função para obter o nome da comunidade
async function getCommunityName(communityId, regionId) {
  // Verifica se os IDs foram passados corretamente
  if (!communityId || !regionId) {
    console.log("Community ID:", communityId);
console.log("Region ID:", regionId);

    console.error("ID da comunidade ou região não fornecido.");
    return "ID inválido"; // Retorna um erro claro se os IDs não estiverem definidos
  }

  try {
    // Acesse o caminho correto no Firestore para a comunidade
    const communityRef = doc(db, "regions", regionId, "communities", communityId);
    const communityDoc = await getDoc(communityRef);

    // Verifica se o documento existe
    if (communityDoc.exists()) {
      // Aqui, você acessa diretamente o campo "name" dentro do documento da comunidade
      const communityName = communityDoc.data().name;

      // Verifica se o campo "name" existe e retorna o valor
      if (communityName) {
        return communityName; // Retorna o nome da comunidade
      } else {
        console.log("Nome da comunidade não encontrado");
        return "Nome não encontrado"; // Retorna um valor padrão caso o nome não seja encontrado
      }
    } else {
      console.log("Comunidade não encontrada");
      return "Comunidade não encontrada"; // Retorna um valor padrão caso a comunidade não seja encontrada
    }
  } catch (error) {
    console.error("Erro ao obter nome da comunidade:", error);
    return "Erro ao obter nome"; // Retorna um erro genérico caso ocorra uma falha na consulta
  }
}



// Função para obter o nome da região
async function getRegionName(regionId) {
  if (!regionId) {
    console.error("ID da região não fornecido.");
    return "ID inválido"; // Retorna um erro claro se o ID da região não for fornecido
  }

  try {
    // Acesse o caminho correto no Firestore para a região
    const regionRef = doc(db, "regions", regionId);
    const regionDoc = await getDoc(regionRef);

    if (regionDoc.exists()) {
      const regionName = regionDoc.data().name;
      if (regionName) {
        return regionName; // Retorna o nome da região
      } else {
        return "Nome da região não encontrado";
      }
    } else {
      return "Região não encontrada";
    }
  } catch (error) {
    console.error("Erro ao obter nome da região:", error);
    return "Erro ao obter nome";
  }
}


// Evento para adicionar uma nova região
document.getElementById("btnAddRegion").addEventListener("click", () => {
  const regionName = prompt("Digite o nome da região:");

  // Verifica se o nome da região está vazio
  if (!regionName || regionName.trim() === "") {
    alert("Por favor, preencha o campo Região.");
  } else {
    addRegion(regionName);
  }
});

// Carrega as regiões ao iniciar
listRegions();
