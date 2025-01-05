// Inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, doc, deleteDoc, updateDoc, addDoc, getDocs, query,where } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

    // Substituindo o ícone FontAwesome por uma imagem
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

    // Adiciona o evento de clique ao item da lista para selecionar a comunidade
    listItem.addEventListener("click", () => onCommunityClick(communityId, communityName, regionId));

    // Monta o item da lista
    listItem.appendChild(communityText);
    listItem.appendChild(communityBadge);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

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

// Função para adicionar uma pessoa
async function addPerson(communityId, regionId) {
  const personName = prompt("Digite o nome da pessoa:");
  const personCPF = prompt("Digite o CPF da pessoa:");

  if (personName && personCPF) {
    try {
      await addDoc(collection(db, "regions", regionId, "communities", communityId, "people"), { 
        name: personName, 
        cpf: personCPF 
      });
      console.log("Pessoa adicionada!");
      listPeople(communityId, regionId); // Atualiza a lista de pessoas
    } catch (e) {
      console.error("Erro ao adicionar pessoa: ", e);
    }
  }
}

// Função para listar as pessoas de uma comunidade
async function listPeople(communityId, regionId) {
  const querySnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));
  const peopleList = document.getElementById("peopleList");
  peopleList.innerHTML = ""; // Limpa a lista de pessoas

  querySnapshot.forEach((doc) => {
    const personData = doc.data();
    const listItem = document.createElement("tr");
    listItem.innerHTML = `
      <td>${personData.name}</td>
      <td>${personData.cpf}</td>
    `;
    peopleList.appendChild(listItem);
  });
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

// Função para baixar a lista de pessoas em PDF
async function downloadPDF(communityId, regionId) {
  const { jsPDF } = window.jspdf; // Certifique-se de que jsPDF está acessível
  const pdfDoc = new jsPDF();

  // Adiciona a logo ao PDF
  const logo = await loadImage('defesa.jpeg'); // Carrega a imagem
  pdfDoc.addImage(logo, 'JPEG', 10, 10, 50, 20); // Adiciona a imagem (x, y, largura, altura)

  // Adiciona um título ao PDF
  pdfDoc.setFontSize(16);
  pdfDoc.text("Lista de Pessoas", 10, 40);
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Comunidade: ${communityId}`, 10, 50);
  pdfDoc.text(`Região: ${regionId}`, 10, 55);
  pdfDoc.line(10, 60, 200, 60); // Linha de separação

  // Cabeçalho da tabela
  pdfDoc.setFontSize(12);
  pdfDoc.text("Nome", 10, 65);
  pdfDoc.text("CPF", 100, 65);
  pdfDoc.line(10, 67, 200, 67); // Linha de separação

  const peopleSnapshot = await getDocs(collection(db, "regions", regionId, "communities", communityId, "people"));
  
  let y = 70; // Posição inicial para o texto
  peopleSnapshot.forEach((personDoc) => {
    const personData = personDoc.data();
    const personName = personData.name;
    const personCPF = personData.cpf;

    // Adiciona os dados à tabela
    pdfDoc.text(personName, 10, y);
    pdfDoc.text(personCPF, 100, y);
    y += 10; // Incrementa a posição y para a próxima linha
  });

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
