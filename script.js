//=======================================
// URL DO APPS SCRIPT
//=======================================

const URL_API = "https://script.google.com/macros/s/AKfycbw-ivhRQoZBuyHdGfRB0jabQxmlKrLg4qglO4uUhsVoXoNl5IJxtlOKZjh-4GHFu3G_hg/exec";

//=======================================
// ELEMENTOS
//=======================================

const pesquisaVendedor = document.getElementById("pesquisaVendedor");
const listaVendedores = document.getElementById("listaVendedores");

const pesquisaLoja = document.getElementById("pesquisaLoja");
const listaLojas = document.getElementById("listaLojas");

const dadosLoja = document.getElementById("dadosLoja");

let vendedores = [];
let lojas = [];

let vendedorSelecionado = "";
let lojaSelecionada = "";

//=======================================
// CARREGAR VENDEDORES
//=======================================

async function carregarVendedores(){

    const resposta = await fetch(URL_API + "?acao=vendedores");

    vendedores = await resposta.json();

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

    pesquisaLoja.disabled=false;

    pesquisaLoja.placeholder="Digite o nome da loja...";

    dadosLoja.innerHTML="";

    const resposta=await fetch(

        URL_API+
        "?acao=lojas&vendedor="+
        encodeURIComponent(nome)

    );

    lojas=await resposta.json();

}

//=======================================
// PESQUISA LOJAS
//=======================================

pesquisaLoja.addEventListener("input",()=>{

    const texto=pesquisaLoja.value.toLowerCase();

    listaLojas.innerHTML="";

    if(texto==""){

        listaLojas.style.display="none";

        return;

    }

    lojas
    .filter(l=>l.toLowerCase().includes(texto))
    .forEach(loja=>{

        const div=document.createElement("div");

        div.className="item";

        div.innerText=loja;

        div.onclick=()=>selecionarLoja(loja);

        listaLojas.appendChild(div);

    });

    listaLojas.style.display="block";

});

//=======================================
// SELECIONAR LOJA
//=======================================

async function selecionarLoja(nome){

    lojaSelecionada=nome;

    pesquisaLoja.value=nome;

    listaLojas.style.display="none";

    carregarDadosLoja();

}

//=======================================
// CARREGAR DADOS DA LOJA
//=======================================

async function carregarDadosLoja(){

    const resposta=await fetch(

        URL_API+
        "?acao=dados"+
        "&vendedor="+encodeURIComponent(vendedorSelecionado)+
        "&loja="+encodeURIComponent(lojaSelecionada)

    );

    const dados=await resposta.json();

    console.log(dados);

}