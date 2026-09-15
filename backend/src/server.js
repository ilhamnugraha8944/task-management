require("dotenv").config({
  path: require("node:path").join(__dirname, "../.env"),
  quiet: true,
});

const express = require("express");
const cors = require("cors");
const routes = require("./routes/route");
const db = require("./config/database");

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
if (process.env.NODE_ENV !== "production")
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");

app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use("/api/materials", express.json({ limit: "2mb" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API berjalan" });
});

app.use("/api", routes);

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large")
    return res
      .status(413)
      .json({
        message: "Data terlalu besar. Foto maksimal 1 MB per material.",
      });
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ message: "Format JSON tidak valid." });
  console.error("Permintaan API gagal:", error.code || error.message);
  res
    .status(500)
    .json({ message: "Gagal menyimpan atau memuat data. Coba lagi." });
});

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});

db.getConnection()
  .then((connection) => {
    console.log("Database MySQL Connected");
    connection.release();
  })
  .catch((error) => {
    console.error("Gagal terhubung ke database MySQL:", error.message);
  });
