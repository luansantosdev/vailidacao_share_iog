//=======================================
// URL DO APPS SCRIPT
//=======================================

const URL_API = "https://script.google.com/macros/s/AKfycbypLNpBug3PLmwd2YHo6y4nmbBGacVPiULFP7YTCXYuWj5leGYmkwJTnTaLqJNebc9RMw/exec";
                 
//=======================================
// ELEMENTOS
//=======================================

const pesquisaVendedor = document.getElementById("pesquisaVendedor");
const listaVendedores = document.getElementById("listaVendedores");

const pesquisaLoja = document.getElementById("pesquisaLoja");

const dadosLoja = document.getElementById("dadosLoja");

let vendedores = [];
let lojas = [];

let vendedorSelecionado = "";
let lojaSelecionada = "";

//=======================================
// CARREGAR VENDEDORES
//=======================================

async function carregarVendedores(){

    try{

        const resposta = await fetch(URL_API + "?acao=vendedores");

        vendedores = await resposta.json();

    }catch(erro){

        console.error("Erro ao carregar vendedores:", erro);
        vendedores = [];

    }

}

carregarVendedores();

//=======================================
// PESQUISA DE VENDEDOR
//=======================================

pesquisaVendedor.addEventListener("input",()=>{

    const texto = pesquisaVendedor.value.toLowerCase();

    listaVendedores.innerHTML="";

    if(texto==""){

        listaVendedores.style.display="none";

        return;

    }

    vendedores
    .filter(v=>v.toLowerCase().includes(texto))
    .forEach(v=>{

        const div=document.createElement("div");

        div.className="item";

        div.innerText=v;

        div.onclick=()=>selecionarVendedor(v);

        listaVendedores.appendChild(div);

    });

    listaVendedores.style.display="block";

});

//=======================================
// SELECIONAR VENDEDOR
//=======================================

async function selecionarVendedor(nome){

    vendedorSelecionado=nome;

    pesquisaVendedor.value=nome;

    listaVendedores.style.display="none";

    pesquisaLoja.disabled=true;

    pesquisaLoja.innerHTML="<option value=''>Carregando lojas...</option>";

    dadosLoja.innerHTML="";

    try{

        const resposta=await fetch(

            URL_API+
            "?acao=lojas&vendedor="+
            encodeURIComponent(nome)

        );

        lojas=await resposta.json();

        preencherSelectLojas();

    }catch(erro){

        console.error("Erro ao carregar lojas:", erro);
        pesquisaLoja.innerHTML="<option value=''>Erro ao carregar lojas</option>";

    }

}

//=======================================
// PREENCHER SELECT DE LOJAS
//=======================================

function preencherSelectLojas(){

    pesquisaLoja.innerHTML="<option value=''>Selecione a loja...</option>";

    lojas.forEach(loja=>{

        const opcao=document.createElement("option");

        opcao.value=loja;

        opcao.innerText=loja;

        pesquisaLoja.appendChild(opcao);

    });

    pesquisaLoja.disabled=false;

}

//=======================================
// SELECIONAR LOJA
//=======================================

pesquisaLoja.addEventListener("change",()=>{

    if(pesquisaLoja.value===""){

        dadosLoja.innerHTML="";

        return;

    }

    lojaSelecionada=pesquisaLoja.value;

    carregarDadosLoja();

});

//=======================================
// CARREGAR DADOS DA LOJA
//=======================================

async function carregarDadosLoja(){

    dadosLoja.innerHTML="<p style='text-align:center;color:#777;'>Carregando...</p>";

    try{

        const resposta=await fetch(

            URL_API+
            "?acao=dados"+
            "&vendedor="+encodeURIComponent(vendedorSelecionado)+
            "&loja="+encodeURIComponent(lojaSelecionada)

        );

        const dados=await resposta.json();

        renderizarTudo(dados);

    }catch(erro){

        console.error("Erro ao carregar dados da loja:", erro);
        dadosLoja.innerHTML="<p style='text-align:center;color:#c00;'>Erro ao carregar dados. Tente novamente.</p>";

    }

}

//=======================================
// FORMATAR SHARE COMO PORCENTAGEM
//=======================================

function formatarShare(valor){

    const numero = Number(valor);

    if(isNaN(numero)){
        return valor;
    }

    const percentual = numero <= 1 ? numero * 100 : numero;

    return percentual.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + "%";

}

//=======================================
// FORMATAR DATA NO FRONT (proteção extra)
//=======================================

function formatarDataFront(valor){

    if(typeof valor === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(valor)){
        return valor;
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if(!isNaN(data.getTime())){

        const dia = String(data.getDate()).padStart(2,"0");
        const mes = String(data.getMonth()+1).padStart(2,"0");
        const ano = data.getFullYear();

        return `${dia}/${mes}/${ano}`;

    }

    return valor;

}

//=======================================
// GERAR ID SEGURO PARA USO EM name/id DO HTML
//=======================================

function idSeguro(data, tipo){
    return String(data).replace(/\//g,"-") + "-" + tipo;
}

//=======================================
// RENDERIZAR AS DUAS SEÇÕES (share iog + share req)
//=======================================

function renderizarTudo(dados){

    dadosLoja.innerHTML="";

    if(!Array.isArray(dados) || dados.length===0){

        dadosLoja.innerHTML =
            "<p style='text-align:center;color:#777;'>Nenhum dado encontrado para essa combinação de vendedor e loja. Verifique se o nome do vendedor e o nome da loja na planilha estão exatamente iguais aos exibidos aqui.</p>";

        return;

    }

    const iog = dados.filter(d=>d.tipo==="share iog");
    const req = dados.filter(d=>d.tipo==="share req");

    dadosLoja.appendChild(

        criarSecao("Share IOG", iog)

    );

    dadosLoja.appendChild(

        criarSecao("Share REQ", req)

    );

}

//=======================================
// CRIAR UMA SEÇÃO (título + cartões ou aviso)
//=======================================

function criarSecao(titulo, lista){

    const secao=document.createElement("div");

    secao.className = "secao-tipo" + (titulo === "Share IOG" ? " secao-iog" : " secao-req");

    const h2=document.createElement("h2");

    h2.innerText=titulo;

    secao.appendChild(h2);

    if(lista.length===0){

        const aviso=document.createElement("p");

        aviso.className="aviso-vazio";

        aviso.innerText="Nenhuma resposta de "+titulo+" encontrada para essa loja.";

        secao.appendChild(aviso);

        return secao;

    }

    const wrapper=document.createElement("div");
    wrapper.className="tabela-wrapper";

    const tabela=document.createElement("table");
    tabela.className="tabela-dados";

    tabela.innerHTML=`
        <thead>
            <tr>
                <th>Data</th>
                <th>Share</th>
                <th>Detalhes da resposta</th>
                <th>Status</th>
                <th>Observação</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const corpo=tabela.querySelector("tbody");

    lista.forEach(item=>{

        const linha=document.createElement("tr");

        linha.className="linha-dia";
        linha.dataset.tipo=item.tipo;

        const dataFormatada = formatarDataFront(item.data);

        const id = idSeguro(dataFormatada, item.tipo);

        linha.dataset.data=dataFormatada;
        linha.dataset.share=item.share;
        linha.dataset.qtdsv=item.qtdSV;
        linha.dataset.qtdtotalpdv=item.qtdTotalPdv;
        linha.dataset.empregado=item.empregado;
        linha.dataset.vendedor=item.vendedor;
        linha.dataset.loja=item.loja;

        linha.innerHTML=`
            <td data-label="Data">${dataFormatada}</td>

            <td data-label="Share">${formatarShare(item.share)}</td>

            <td data-label="Detalhes da resposta">${item.qtdSV} de ${item.qtdTotalPdv} (S&V / total PDV)</td>

            <td data-label="Status">
                <div class="radio radio-tabela">
                    <label>
                        <input type="radio" name="status-${id}" value="Correto">
                        Correto
                    </label>
                    <label>
                        <input type="radio" name="status-${id}" value="Incorreto">
                        Incorreto
                    </label>
                </div>
            </td>

            <td data-label="Observação">
                <textarea id="obs-${id}" placeholder="Observação (opcional)"></textarea>
            </td>
        `;

        corpo.appendChild(linha);

    });

    wrapper.appendChild(tabela);

    secao.appendChild(wrapper);

    return secao;

}

//=======================================
// ENVIAR VALIDAÇÃO
//=======================================

document.getElementById("enviar").addEventListener("click", async ()=>{

    const linhas=document.querySelectorAll(".linha-dia");

    if(linhas.length===0){
        alert("Selecione um vendedor e uma loja antes de enviar.");
        return;
    }

    const respostas=[];

    for(const linha of linhas){

        const id = idSeguro(linha.dataset.data, linha.dataset.tipo);

        const marcado=linha.querySelector(`input[name="status-${id}"]:checked`);

        if(!marcado){
            alert("Marque Correto ou Incorreto em todos os dias antes de enviar.");
            return;
        }

        respostas.push({
            vendedor: linha.dataset.vendedor,
            empregado: linha.dataset.empregado,
            loja: linha.dataset.loja,
            data: linha.dataset.data,
            qtdSV: linha.dataset.qtdsv,
            qtdTotalPdv: linha.dataset.qtdtotalpdv,
            tipo: linha.dataset.tipo,
            share: linha.dataset.share,
            status: marcado.value,
            observacao: document.getElementById(`obs-${id}`).value
        });

    }

    const botao=document.getElementById("enviar");

    botao.disabled=true;
    botao.innerText="Enviando...";

    try{

        await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify(respostas)
        });

        alert("Validação enviada com sucesso!");

        dadosLoja.innerHTML="";
        pesquisaVendedor.value="";
        pesquisaLoja.innerHTML="<option value=''>Selecione primeiro o vendedor...</option>";
        pesquisaLoja.disabled=true;

    }catch(erro){

        alert("Erro ao enviar. Tente novamente.");
        console.error(erro);

    }

    botao.disabled=false;
    botao.innerText="ENVIAR VALIDAÇÃO";

});
