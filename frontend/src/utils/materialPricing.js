export function comparisonWeightKg(material) {
  if (material.isiSatuan === 'kg') {
    return Math.max(0, Number(material.isiNilai) || 0)
  }

  const grossWeight = Number(material.beratTotalKg) || 0
  const packagingWeight = Number(material.beratKemasanKg) || 0

  return Math.max(0, grossWeight - packagingWeight)
}

export function comparisonPricePerKg(material) {
  const weight = comparisonWeightKg(material)
  const price = Number(material.hargaKemasan) || 0
  const unit = material.satuanHarga

  if (unit === 'Kg') return price
  if (unit === 'L') {
    return material.isiSatuan === 'L' && weight > 0
      ? (price * Number(material.isiNilai)) / weight
      : 0
  }
  if (unit && unit.toLowerCase() !== material.kemasan?.toLowerCase()) return 0

  return weight > 0 ? price / weight : 0
}
