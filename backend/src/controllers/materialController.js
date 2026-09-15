const repository = require("../repository/materialRepository");

function validateMaterial(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Data cat tidak valid.");
  const material = {};
  const fields = {
    jenis: [100, true],
    merek: [100, true],
    subMerek: [150],
    kodeWarna: [100],
    warna: [150],
    bentuk: [100],
    kemasan: [100, true],
    toko: [200, true],
    alamat: [500, true],
    satuanLuas: [20],
  };
  for (const [field, [max, required]] of Object.entries(fields)) {
    const value = body[field] ?? "";
    if (
      typeof value !== "string" ||
      value.trim().length > max ||
      (required && !value.trim())
    ) {
      throw new Error(
        `${field} ${required ? "wajib diisi dan " : ""}maksimal ${max} karakter.`,
      );
    }
    material[field] = value.trim();
  }
  if (!["L", "kg"].includes(body.isiSatuan))
    throw new Error("Satuan isi harus L atau kg.");
  material.isiSatuan = body.isiSatuan;
  material.satuanHarga = body.satuanHarga ?? material.kemasan;
  if (!["Kg", "L", "Galon", "Pail"].includes(material.satuanHarga))
    throw new Error("Satuan harga harus Kg, L, Galon, atau Pail.");
  if (material.satuanHarga === "L" && material.isiSatuan !== "L")
    throw new Error("Harga per L memerlukan Volume Isi dalam L agar dapat dihitung ke kg.");
  if (["Galon", "Pail"].includes(material.satuanHarga) &&
      material.satuanHarga.toLowerCase() !== material.kemasan.toLowerCase())
    throw new Error("Untuk harga per Galon atau Pail, pilih satuan yang sesuai kemasan.");
  for (const field of [
    "isiNilai",
    "beratTotalKg",
    "beratKemasanKg",
    "hargaKemasan",
    "luas",
  ]) {
    const raw = body[field];
    if (field === "luas" && (raw === "" || raw == null)) {
      material.luas = null;
      continue;
    }
    const optional = field === "beratTotalKg" && body.isiSatuan === "kg";
    const value = optional && (raw === "" || raw == null) ? 0 : raw;
    const decimals = field === "hargaKemasan" ? 2 : 4;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > (field === "hargaKemasan" ? 1e9 : 1e6) ||
      Math.abs(value - Number(value.toFixed(decimals))) > 1e-9 ||
      (["isiNilai", "hargaKemasan", "luas"].includes(field) && value <= 0)
    ) {
      throw new Error(
        `${field} harus berupa angka valid, maksimal ${decimals} angka desimal.`,
      );
    }
    material[field] = value;
  }
  if (
    material.isiSatuan === "L" &&
    material.beratTotalKg <= material.beratKemasanKg
  ) {
    throw new Error(
      "Berat total harus lebih besar daripada berat kemasan kosong.",
    );
  }
  material.foto = body.foto ?? "";
  if (typeof material.foto !== "string") throw new Error("Foto tidak valid.");
  if (material.foto) {
    const match =
      /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
        material.foto,
      );
    if (!match || material.foto.length > 1400000)
      throw new Error("Foto harus PNG, JPEG, WebP, atau GIF, maksimal 1 MB.");
    const buffer = Buffer.from(match[2], "base64");
    const signatures = {
      png: buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      jpeg: buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255,
      gif: ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6)),
      webp:
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP",
    };
    if (
      !signatures[match[1]] ||
      buffer.length > 1024 * 1024 ||
      buffer.toString("base64") !== match[2]
    ) {
      throw new Error("Isi foto tidak sesuai format atau melebihi 1 MB.");
    }
  }
  return material;
}

function validId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: "ID material tidak valid." });
    return null;
  }
  return id;
}

async function list(req, res) {
  res.json({ data: await repository.findAll() });
}

async function get(req, res) {
  const id = validId(req, res);
  if (!id) return;
  const material = await repository.findById(id);
  if (!material)
    return res.status(404).json({ message: "Material tidak ditemukan." });
  res.json({ data: material });
}

async function save(req, res) {
  const id = req.params.id ? validId(req, res) : null;
  if (req.params.id && !id) return;
  let material;
  try {
    material = validateMaterial(req.body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  if (id && !(await repository.update(id, material))) {
    return res.status(404).json({ message: "Material tidak ditemukan." });
  }
  const savedId = id || (await repository.create(material));
  res.status(id ? 200 : 201).json({ data: await repository.findById(savedId) });
}

async function remove(req, res) {
  const id = validId(req, res);
  if (!id) return;
  if (!(await repository.remove(id)))
    return res.status(404).json({ message: "Material tidak ditemukan." });
  res.json({ message: "Material berhasil dihapus." });
}

module.exports = { list, get, save, remove, validateMaterial };
