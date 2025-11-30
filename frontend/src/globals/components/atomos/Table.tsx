import {
    ChevronUp,
    ChevronDown,
    PackagePlus,
    PackageMinus,
} from "lucide-react"

interface contentConfig {
    columnName: string, // Nombre que se renderiza en la columna
    key: string, // clave del arreglo data que coloca el dato
    isId: boolean, // si el valor del campo es unico
    formatFunction?(elem: any): string, // funcion para formatear el dato, por ejemplo para formatear fechas
    sorts: boolean // si este campo se usa para ordenar
    draw: boolean // si se dibuja este campo en la tabla
}

interface sortConfig {
    currentSort: string;
    currentOrder: string;
    sortHandler(sort: string, order: string): void;
}

interface StripedTableProps {
    contentConfig: contentConfig[];
    data: any[];
    className?: string;
    color?: string;
    sortConfig?: sortConfig;
    rowAction?(row: any): void;
    showMedicationActions?: boolean;
    onMedicationAdd?(row: any): void;
    onMedicationRemove?(row: any): void;
}




export default function StripedTable({
    contentConfig,
    data,
    className,
    color,
    sortConfig,
    rowAction,
    showMedicationActions,
    onMedicationAdd,
    onMedicationRemove,
}: StripedTableProps) {
    if (contentConfig.some((elem) => elem.sorts) && !sortConfig) {
        console.error("La tabla se configuro con columnas que se ordenan pero no se definio sortConfig!")
    }
    const idCell = contentConfig.find((cell) => cell.isId);
    const idKey = idCell ? idCell.key : "";
    return (
        <table className={`${className} table-auto bg-white`}>
            <thead>
                <tr>
                    {contentConfig.map((column, index) => {
                        if (column.draw)
                            return (
                                <th key={index} className="px-4 py-2">
                                    {column.sorts && sortConfig
                                        ? (<div className="flex flex-row place-items-center justify-center"> {column.columnName} {
                                            sortConfig.currentSort === column.key
                                                ? sortConfig.currentOrder === "asc"
                                                    ? <ChevronDown className="cursor-pointer text-accent" onClick={() => sortConfig.sortHandler(column.key, "desc")} />
                                                    : <ChevronUp className="cursor-pointer text-accent" onClick={() => sortConfig.sortHandler(column.key, "asc")} />
                                                : <ChevronDown className="cursor-pointer text-gris-oscuro" onClick={() => sortConfig.sortHandler(column.key, "asc")} />
                                        }
                                        </div>)
                                        : column.columnName}
                                </th>)
                    }
                    )}
                    {showMedicationActions && (
                        <th className="px-4 py-2">Acciones</th>
                    )}
                </tr>
            </thead>
            <tbody className="text-center">
                {
                    data.map((elem, index) => {
                        return(
                            <tr 
                                className={`
                                    ${index % 2 == 0 ? color ? `bg-${color}` : 'bg-primary' : ''}
                                    ${rowAction ? 'cursor-pointer' : ''}
                                `
                                }
                                key={idKey ? elem[idKey] : index}
                                onClick={() => rowAction ? rowAction(elem) : {}}
                            >
                                {
                                    contentConfig.map((cell) => {
                                        if (cell.draw)
                                            return (
                                                <td key={cell.key} className="px-4 py-2">
                                                    {cell.formatFunction ? cell.formatFunction(elem[cell.key]) : elem[cell.key]}
                                                </td>
                                            )
                                    })
                                }
                                {showMedicationActions && (
                                    <td className="px-4 py-2">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* <CHANGE> Added blue background square for add button */}
                                            <button
                                                type="button"
                                                aria-label="Agregar medicamento"
                                                className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors duration-200 text-blue-600 hover:text-blue-700"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    onMedicationAdd?.(elem)
                                                }}
                                            >
                                                <PackagePlus className="w-7 h-7" />
                                            </button>
                                            {/* <CHANGE> Added red background square for remove button */}
                                            <button
                                                type="button"
                                                aria-label="Quitar medicamento"
                                                className="p-2 rounded-md bg-red-100 hover:bg-red-200 transition-colors duration-200 text-red-600 hover:text-red-700"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    onMedicationRemove?.(elem)
                                                }}
                                            >
                                                <PackageMinus className="w-7 h-7" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}