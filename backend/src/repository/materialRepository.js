const db = require("../config/database");

const fields = {
  jenis: "jenis",
  merek: "merek",
  subMerek: "sub_merek",
  kodeWarna: "kode_warna",
  warna: "warna",
  bentuk: "bentuk",
  kemasan: "kemasan",
  isiNilai: "isi_nilai",
  isiSatuan: "isi_satuan",
  beratTotalKg: "berat_total_kg",
  beratKemasanKg: "berat_kemasan_kg",
  luas: "luas",
  satuanLuas: "satuan_luas",
  toko: "toko",
  alamat: "alamat",
  hargaKemasan: "harga_kemasan",
  satuanHarga: "satuan_harga",
  foto: "foto",
};
const keys = Object.keys(fields);
const columns = Object.values(fields);
const select = `SELECT id, ${keys.map((key) => `${fields[key]} AS ${key}`).join(", ")},
  berat_isi_kg AS beratIsiKg, harga_komparasi AS hargaKomparasi FROM materials`;
const numberFields = [
  "id",
  "isiNilai",
  "beratTotalKg",
  "beratKemasanKg",
  "luas",
  "hargaKemasan",
  "beratIsiKg",
  "hargaKomparasi",
];

function normalize(row) {
  row.satuanHarga = row.satuanHarga || row.kemasan;
  for (const key of numberFields)
    if (row[key] != null) row[key] = Number(row[key]);
  return row;
}

async function findAll() {
  // ponytail: katalog kecil dimuat sekaligus; pindah ke paginasi server dan URL foto jika data membesar.
  const [rows] = await db.query(`${select} ORDER BY id`);
  return rows.map(normalize);
}

async function findById(id) {
  const [rows] = await db.execute(`${select} WHERE id = ?`, [id]);
  return rows[0] ? normalize(rows[0]) : null;
}

async function create(material) {
  const [result] = await db.execute(
    `INSERT INTO materials (${columns.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    keys.map((key) => material[key]),
  );
  return result.insertId;
}

async function update(id, material) {
  const [result] = await db.execute(
    `UPDATE materials SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE id = ?`,
    [...keys.map((key) => material[key]), id],
  );
  return result.affectedRows === 1;
}

async function remove(id) {
  const [result] = await db.execute("DELETE FROM materials WHERE id = ?", [id]);
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, create, update, remove };
