const API_URL = "https://filmes-enzo-balduino-santos.vercel.app"

const sectionFilmes = document.querySelector(".filmes")
const modal = document.querySelector("#modal")
const form = document.querySelector("#form-filme")
const modalTitulo = document.querySelector("#modal-titulo")

let filmes = []
let idEditando = null // null => criando um novo filme

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]))
}

async function buscarFilmes() {
    // acessar a rota GET do backend e exibir os filmes na tela
    try {
        const resposta = await fetch(`${API_URL}/`)
        filmes = await resposta.json()
    } catch (erro) {
        console.log(erro)
        alert("Não foi possível carregar os filmes.")
        return
    }

    sectionFilmes.innerHTML = ""

    if (filmes.length === 0) {
        sectionFilmes.innerHTML = `<p class="vazio">Nenhum filme cadastrado. Use “Novo filme” para adicionar o primeiro.</p>`
        return
    }

    filmes.forEach((filme) => {
        const { classe, texto } = classificacao(filme.ageRating)

        sectionFilmes.innerHTML += `
            <article class="filme">
                <div class="info">
                    <h2>${escapar(filme.title)}</h2>
                    <p class="meta">${escapar(filme.gender)}, ${formatarDuracao(filme.duration)}</p>
                </div>
                <span class="selo ${classe}" title="Classificação indicativa: ${texto === "L" ? "livre" : texto + " anos"}">${texto}</span>
                <div class="acoes">
                    <button type="button" class="link" onclick="abrirModal(${Number(filme.id)})">Editar</button>
                    <button type="button" class="link perigo" onclick="apagarFilme(${Number(filme.id)})">Apagar</button>
                </div>
            </article>
        `
    })
}

// selos oficiais da classificação indicativa
function classificacao(idade) {
    const n = Number(idade)
    if (n <= 0) return { classe: "c-l", texto: "L" }
    if (n <= 10) return { classe: "c-10", texto: "10" }
    if (n <= 12) return { classe: "c-12", texto: "12" }
    if (n <= 14) return { classe: "c-14", texto: "14" }
    if (n <= 16) return { classe: "c-16", texto: "16" }
    return { classe: "c-18", texto: "18" }
}

function formatarDuracao(minutos) {
    const n = Number(minutos)
    if (n < 60) return `${n} min`
    const m = n % 60
    return `${Math.floor(n / 60)}h${m ? String(m).padStart(2, "0") : ""}`
}

function abrirModal(id = null) {
    idEditando = id
    form.reset()

    if (id === null) {
        modalTitulo.textContent = "Novo filme"
    } else {
        const filme = filmes.find((f) => f.id === id)
        modalTitulo.textContent = "Editar filme"
        form.title.value = filme.title
        form.gender.value = filme.gender
        form.duration.value = filme.duration
        form.ageRating.value = filme.ageRating
    }

    modal.showModal()
}

async function salvarFilme(evento) {
    evento.preventDefault()

    const dados = {
        title: form.title.value.trim(),
        gender: form.gender.value.trim(),
        duration: form.duration.value,
        ageRating: form.ageRating.value
    }

    const editando = idEditando !== null

    // avisar se já existe outro filme com o mesmo título
    const repetido = filmes.some((f) =>
        f.id !== idEditando && f.title.trim().toLowerCase() === dados.title.toLowerCase()
    )

    if (repetido && !confirm(`Já existe um filme chamado "${dados.title}". Deseja ${editando ? "salvar" : "criar"} mesmo assim?`)) {
        return
    }

    const url = editando ? `${API_URL}/update/${idEditando}` : `${API_URL}/create`

    try {
        const resposta = await fetch(url, {
            method: editando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        })

        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`)
    } catch (erro) {
        console.log(erro)
        alert("Não foi possível salvar o filme.")
        return
    }

    modal.close()
    buscarFilmes()
}

async function apagarFilme(id) {
    const filme = filmes.find((f) => f.id === id)
    if (!confirm(`Apagar o filme "${filme.title}"?`)) return

    try {
        const resposta = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" })
        if (!resposta.ok) throw new Error(`Erro ${resposta.status}`)
    } catch (erro) {
        console.log(erro)
        alert("Não foi possível apagar o filme.")
        return
    }

    buscarFilmes()
}

document.querySelector("#btn-novo").addEventListener("click", () => abrirModal())
document.querySelector("#btn-cancelar").addEventListener("click", () => modal.close())
form.addEventListener("submit", salvarFilme)

buscarFilmes()
