export function formatMaterialColor(material) {
  return [material.kodeWarna, material.warna].filter(Boolean).join(' - ')
}

export function parseMaterialColor(value, materials = []) {
  const text = value.trim()
  if (!text) return { kodeWarna: '', warna: '' }

  const match = materials.find((item) =>
    [formatMaterialColor(item), item.kodeWarna, item.warna].some(
      (color) => color && color.toLowerCase() === text.toLowerCase(),
    ),
  )
  if (match) return { kodeWarna: match.kodeWarna || '', warna: match.warna || '' }

  const separator = text.indexOf(' - ')
  if (separator === -1) return { kodeWarna: '', warna: text }
  return {
    kodeWarna: text.slice(0, separator).trim(),
    warna: text.slice(separator + 3).trim(),
  }
}
