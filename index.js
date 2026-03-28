const express = require("express");
const pool = require("./db");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
///// get
app.get("/tareas", async (req, res) => {
  try {
    // const time = await pool.query("SELECT NOW()");
    const tareas = await pool.query('SELECT * FROM tareas ORDER BY id ASC');

    res.json({
    //   serverTime: time.rows[0],
      tareas: tareas.rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error conectando a PostgreSQL" });
  }
});

//// Post
app.post("/tareas", async (req,res)=>{
    try {
      const { titulo, completado } = req.body;
      const crearTareas = await pool.query("INSERT INTO tareas (titulo, completado) VALUES ($1, $2) RETURNING *", [titulo, completado]);
      res.json(crearTareas.rows[0])
    } catch (error) {
      res.status(500).send({mensaje:"No se pudo crear tarea"})
    }
})

//// Patch
app.patch("/tareas/:id", async (req,res)=>{
  try {
    const id = Number(req.params.id);
    const { titulo, completado } = req.body;
    const actualizar = await pool.query(
      `UPDATE tareas 
       SET 
         titulo = COALESCE($1, titulo),
         completado = COALESCE($2, completado)
       WHERE id = $3
       RETURNING *`,
      [titulo, completado, id]
    );
    if (actualizar.rows.length === 0) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    res.json(actualizar.rows[0]);
  } catch (error) {
    res.status(500).send({mensaje:"No se pudo modificar tarea"})
  }
})

app.listen(3000, () => {
  console.log("🟢 Servidor corriendo en http://localhost:3000");
});