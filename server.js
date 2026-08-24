import express from "express"
import mysql2 from "mysql2"
import cors from "cors"

const app = express()

// CRUD => Create, Read, Update, Delete

app.use(express.json())
app.use(cors())

app.get("/", (request, response) => {
    const selectCommand = "SELECT * FROM filmes_EnzoBalduino2"

    sql.query(selectCommand, (error, data) => {
        if (error) {
            console.log(error)
            return
        }

        response.json(data)
    })
})

app.post("/create", (request, response) => {
    const { title, gender, duration, ageRating } = request.body

    const insertCommand = "INSERT INTO filmes_EnzoBalduino2(title, gender, duration, ageRating) VALUES (?, ?, ?, ?)"

    sql.query(insertCommand, [title, gender, duration, ageRating], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.status(201).json({
            message: "Filme criado com sucesso!"
        })
    })
})

app.delete("/delete/:id", (request, response) => {
    const { id } = request.params

    const deleteCommand = "DELETE FROM filmes_EnzoBalduino2 WHERE id=?"

    sql.query(deleteCommand, [id], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.json({
            message: "Filme apagado com sucesso!"
        })
    })
})

// atualizar tarefas
app.put("/update/:id", async (request, response) => {
    const { id } = request.params
    const { title, gender, duration, ageRating } = request.body

    const updateCommand = "UPDATE filmes_EnzoBalduino2 SET title = ?, gender = ?, duration = ?, ageRating = ? WHERE id = ?"

    sql.query(updateCommand, [title, gender, duration, ageRating, id], (error) => {
        if (error) {
            console.log(error)
            return
        }

        response.json({
            message: "Filme atualizado com sucesso!"
        })
    })
})

app.listen(3067, () => {
    console.log("Servidor rodando na porta 3067")
})

const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_filmes03TB"
})