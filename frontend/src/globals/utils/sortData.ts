/**
 * Ordena un array de objetos según un campo y orden especificados
 * @param dataToSort - Array de objetos a ordenar
 * @param sortField - Campo por el cual ordenar
 * @param order - Orden: 'asc' (ascendente) o 'desc' (descendente)
 * @returns Array ordenado
 */
export function sortData<T extends Record<string, any>>(
  dataToSort: T[],
  sortField?: string,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  if (!sortField) return dataToSort;

  return [...dataToSort].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Manejar valores numéricos
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    }

    // Manejar strings
    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();

    if (order === 'desc') {
      return bStr.localeCompare(aStr);
    }
    return aStr.localeCompare(bStr);
  });
}

export default sortData;

