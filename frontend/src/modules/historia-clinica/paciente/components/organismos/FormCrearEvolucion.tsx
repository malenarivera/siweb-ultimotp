'use client'
import useObtenerItemsDM from "@/modules/historia-clinica/hooks/useObtenerItemsDM";
import useCargarEvolucion from "@/modules/historia-clinica/hooks/useCargarEvolucion";
import useObtenerEvolucion from "@/modules/historia-clinica/hooks/useObtenerEvolucion";
import { useState, useEffect } from "react";
import { EvolucionCompleta } from "@/modules/historia-clinica/types/EvolucionCompleta";

export default function CrearEvolucion({goBack, evoluciones, setEvoluciones, id_usuario}:
    {goBack(): void, evoluciones: EvolucionCompleta[], setEvoluciones: any, id_usuario?: string | number}) {
    
    const { obtenerItemsDM, itemsDM, isLoading: buscandoItems, error: errorItems} = useObtenerItemsDM()
    const { cargarEvolucion, isLoading: cargandoEvolucion, error: errorCargaEvolucion} = useCargarEvolucion()
    const { obtenerEvolucion, evolucion, isLoading: obteniendoEvolucion, error: errorObtenerEvolucion} = useObtenerEvolucion()
    const [itemsPorEje, setItemsPorEje] = useState({})
    const [pedirConfirmacion, setPedirConfirmacion] = useState(false);
    const [mostrarResultado, setMostrarResultado] = useState(false);
    const initialFormState = {
        observacion: "",
        id_item1: "",
        id_item2: "",
        id_item3: "",
        id_item4: "",
        id_item5: ""
    }
    const [formData, setFormData] = useState(initialFormState);
    const [validationErrors, setValidationErrors] = useState<{campo: string, msg: string}[]>([]); // Agregar este estado para manejar los mensajes de error
    const [addMultiaxial, setAddMultiaxial] = useState(false); //volvemos a false para que los tests den bien

    const handleMultiaxialCheck = async () => {
        const agregaMultiaxial = !addMultiaxial;
        setAddMultiaxial(agregaMultiaxial);
        if (agregaMultiaxial && itemsDM.length === 0) {
            //Busco solo una vez ya que el endpoint siempre devuelve lo mismo..
            const items = await obtenerItemsDM();
            // Ahora filtro por ejes
            const itemsEje1 = items.filter(item => item.eje === 1);
            const itemsEje2 = items.filter(item => item.eje === 2);
            const itemsEje3 = items.filter(item => item.eje === 3);
            const itemsEje4 = items.filter(item => item.eje === 4);
            const itemsEje5 = items.filter(item => item.eje === 5);
            setItemsPorEje({
                eje1: itemsEje1,
                eje2: itemsEje2,
                eje3: itemsEje3,
                eje4: itemsEje4,
                eje5: itemsEje5
            })
        } else if (!agregaMultiaxial) {
            // Reseteamos los selects
            setFormData(prev => ({
            ...prev,
            ["id_item1"]: "",
            ["id_item2"]: "",
            ["id_item3"]: "",
            ["id_item4"]: "",
            ["id_item5"]: "",
        }));
        }
    }
    // Función para manejar cambios en los inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Funcion para verificar campos obligatorios
    const missingFields = () => {
        // Lista de campos requeridos con sus nombres amigables
        const requiredFields: { key: keyof FormData; label: string }[] = [
            { key: 'observacion', label: 'Observacion' },
        ];

        const requiredMultiaxialFields: { key: keyof FormData; label: string }[] = [
            { key: 'id_item1', label: 'Primer eje del Diagnostico Multiaxial' },
            { key: 'id_item2', label: 'Segundo eje del Diagnostico Multiaxial' },
            { key: 'id_item3', label: 'Tercer eje del Diagnostico Multiaxial' },
            { key: 'id_item4', label: 'Cuarto eje del Diagnostico Multiaxial' },
            { key: 'id_item5', label: 'Quinto eje del Diagnostico Multiaxial' }
        ];
        
        // Verificar campos vacíos
        // Evolucion Base
        let missingFields = requiredFields.filter(field => !formData[field.key]);

        // Multiaxial
        if (addMultiaxial)
            missingFields = missingFields.concat(requiredMultiaxialFields.filter(field => !formData[field.key]));
        
        if (missingFields.length > 0) {
            // Crear mensajes de error específicos
            const errors: {campo: string, msg: string}[] = missingFields.map(field => ({campo: field.key, msg: `El campo ${field.label} es obligatorio.`}));
            setValidationErrors(errors);
            
            // Mostrar alerta con los campos faltantes
            const errorMessage = `Existen campos faltantes: \n\n${errors.map(error => error.msg).join('\n')}`;
            alert(errorMessage);
            
            // Enfocar el primer campo faltante
            const firstMissingField = document.getElementById(missingFields[0].key);
            if (firstMissingField) {
                firstMissingField.focus();
            }
            return true;
        }
        return false;
    }

    // Función para manejar el envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Si todos los campos requeridos están completos, limpiar errores y mostrar modal de confirmación
        if (missingFields())
            return;


        setValidationErrors([]);
        setPedirConfirmacion(true);
    };
    
    const handleConfirmarGuardado = async () => {
        setMostrarResultado(true);
        setPedirConfirmacion(false);
        const targetIdUsuario = typeof id_usuario !== 'undefined' && id_usuario !== null ? id_usuario : 10;
        let id_evolucion_cargada = await cargarEvolucion(Number(targetIdUsuario), formData);
        if (id_evolucion_cargada != null) {
            // Obtengo los datos completos
            const mi_evolucion_cargada = await obtenerEvolucion(Number(targetIdUsuario), id_evolucion_cargada);
            setEvoluciones([...evoluciones, mi_evolucion_cargada]);
        }
    };

    return (
        <>
            <div id="formulario" className={`overflow-hidden ${pedirConfirmacion || mostrarResultado ? 'max-h-0' : ''}`}>
                <form
                    id="formulario-evolucion"
                    onSubmit={handleSubmit}
                >
                    <div className="w-full mb-4 border-b border-gris pb-6">
                        <div className="mb-1">{/*flex items-center */}
                            <label htmlFor="observacion" className="block text-sm font-medium text-gris-oscuro uppercase">
                            Observacion <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <textarea 
                            id="observacion"
                            data-testid="observacion"
                            name="observacion" 
                            type="text"
                            required
                            value={formData.observacion} 
                            onChange={handleInputChange} 
                            className={`w-full px-3 py-2 border ${
                            validationErrors.some(error => error.campo === "observacion")
                                ? 'border-red-500 ring-1 ring-red-500' 
                                : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-manzana bg-white text-black`}
                            placeholder="Ingrese la Observacion de la evolucion..."
                        ></textarea>
                        { validationErrors.some(error => error.campo === "observacion") && (
                            <p data-testid="observacion-error" id="observacion-error" className="text-red-500 text-sm mt-1">
                            {validationErrors[validationErrors.findIndex(error => error.campo === "observacion")].msg}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="cargarMultiaxial" className="text-md font-medium text-gris-oscuro">Cargar Diagnostico Multiaxial?</label>
                        <input className="ml-2 h-4 w-4" type="checkbox" id="cargarMultiaxial" data-testid="cargarMultiaxial" checked={addMultiaxial} onChange={handleMultiaxialCheck}></input>
                    </div>
                    <div data-testid="divMultiaxial" className={`bg-white transition-all duration-300 ease-in-out overflow-hidden ${addMultiaxial ? 'max-h-[800px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'}`}>
                        <div className="prose prose-sm text-gray-800 whitespace-pre-line">
                            <div className="w-full">
                                <label htmlFor="id_item1" className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                                    Primer Eje del Diagnostico Multiaxial <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="id_item1" 
                                    name="id_item1" 
                                    value={formData.id_item1} 
                                    required={addMultiaxial}
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-manzana bg-white
                                        ${
                                        validationErrors.some(error => error.campo === "id_item1")
                                            ? 'border-red-500 ring-1 ring-red-500' 
                                            : 'border-gray-300'
                                        }    
                                    `}
                                >
                                    <option className="text-gris" value="">Seleccione el valor del primer eje...</option>
                                    {
                                        Object.keys(itemsPorEje).length !== 0 && itemsPorEje.eje1.map(item => {
                                            return (
                                                <option key={item.id_item} value={item.id_item}>{`(${item.id_item}) ${item.descripcion}`}</option>
                                            )
                                        })
                                    }
                                </select>
                                { validationErrors.some(error => error.campo === "id_item1") && (
                                    <p id="id_item1-error" className="text-red-500 text-sm mt-1">
                                    {validationErrors[validationErrors.findIndex(error => error.campo === "id_item1")].msg}
                                    </p>
                                )}

                                <label htmlFor="id_item2" className="block text-sm font-medium text-gray-700 mb-1 uppercase mt-2">
                                    Segundo Eje del Diagnostico Multiaxial <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="id_item2" 
                                    name="id_item2" 
                                    value={formData.id_item2} 
                                    required={addMultiaxial}
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-manzana bg-white
                                        ${
                                        validationErrors.some(error => error.campo === "id_item2")
                                            ? 'border-red-500 ring-1 ring-red-500' 
                                            : 'border-gray-300'
                                        }    
                                    `}
                                >
                                    <option className="text-gris" value="">Seleccione el valor del segundo eje...</option>
                                    {
                                        Object.keys(itemsPorEje).length !== 0 && itemsPorEje.eje2.map(item => {
                                            return (
                                                <option key={item.id_item} value={item.id_item}>{`(${item.id_item}) ${item.descripcion}`}</option>
                                            )
                                        })
                                    }
                                </select>
                                { validationErrors.some(error => error.campo === "id_item2") && (
                                    <p id="id_item2-error" className="text-red-500 text-sm mt-1">
                                    {validationErrors[validationErrors.findIndex(error => error.campo === "id_item2")].msg}
                                    </p>
                                )}

                                <label htmlFor="id_item3" className="block text-sm font-medium text-gray-700 mb-1 uppercase mt-2">
                                    Tercer Eje del Diagnostico Multiaxial <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="id_item3" 
                                    name="id_item3" 
                                    value={formData.id_item3} 
                                    required={addMultiaxial}
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-manzana bg-white
                                        ${
                                        validationErrors.some(error => error.campo === "id_item3")
                                            ? 'border-red-500 ring-1 ring-red-500' 
                                            : 'border-gray-300'
                                        }    
                                    `}
                                >
                                    <option className="text-gris" value="">Seleccione el valor del tercer eje...</option>
                                    {
                                        Object.keys(itemsPorEje).length !== 0 && itemsPorEje.eje3.map(item => {
                                            return (
                                                <option key={item.id_item} value={item.id_item}>{`(${item.id_item}) ${item.descripcion}`}</option>
                                            )
                                        })
                                    }
                                </select>
                                { validationErrors.some(error => error.campo === "id_item3") && (
                                    <p id="id_item3-error" className="text-red-500 text-sm mt-1">
                                    {validationErrors[validationErrors.findIndex(error => error.campo === "id_item3")].msg}
                                    </p>
                                )}

                                <label htmlFor="id_item4" className="block text-sm font-medium text-gray-700 mb-1 uppercase mt-2">
                                    Cuarto Eje del Diagnostico Multiaxial <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="id_item4" 
                                    name="id_item4" 
                                    value={formData.id_item4} 
                                    required={addMultiaxial}
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-manzana bg-white
                                        ${
                                        validationErrors.some(error => error.campo === "id_item4")
                                            ? 'border-red-500 ring-1 ring-red-500' 
                                            : 'border-gray-300'
                                        }    
                                    `}
                                >
                                    <option className="text-gris" value="">Seleccione el valor del cuarto eje...</option>
                                    {
                                        Object.keys(itemsPorEje).length !== 0 && itemsPorEje.eje4.map(item => {
                                            return (
                                                <option key={item.id_item} value={item.id_item}>{`(${item.id_item}) ${item.descripcion}`}</option>
                                            )
                                        })
                                    }
                                </select>
                                { validationErrors.some(error => error.campo === "id_item4") && (
                                    <p id="id_item4-error" className="text-red-500 text-sm mt-1">
                                    {validationErrors[validationErrors.findIndex(error => error.campo === "id_item4")].msg}
                                    </p>
                                )}

                                <label htmlFor="id_item5" className="block text-sm font-medium text-gray-700 mb-1 uppercase mt-2">
                                    Quinto Eje del Diagnostico Multiaxial <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="id_item5" 
                                    name="id_item5" 
                                    value={formData.id_item5} 
                                    required={addMultiaxial}
                                    onChange={handleInputChange} 
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-manzana bg-white
                                        ${
                                        validationErrors.some(error => error.campo === "id_item5")
                                            ? 'border-red-500 ring-1 ring-red-500' 
                                            : 'border-gray-300'
                                        }    
                                    `}
                                >
                                    <option className="text-gris" value="">Seleccione el valor del quinto eje...</option>
                                    {
                                        Object.keys(itemsPorEje).length !== 0 && itemsPorEje.eje5.map(item => {
                                            return (
                                                <option key={item.id_item} value={item.id_item}>{`(${item.id_item}) ${item.descripcion}`}</option>
                                            )
                                        })
                                    }
                                </select>
                                { validationErrors.some(error => error.campo === "id_item5") && (
                                    <p id="id_item5-error" className="text-red-500 text-sm mt-1">
                                    {validationErrors[validationErrors.findIndex(error => error.campo === "id_item5")].msg}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                        type="button"
                        onClick={goBack}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 
                                transition-all duration-200 focus-visible:outline focus-visible:outline-2 
                                focus-visible:outline-gray-600"
                        >
                        Volver
                        </button>
                        <button
                        className="px-6 py-2 rounded-lg flex items-center transition-all duration-200 
                                bg-primary text-black hover:bg-primary/80 
                                focus-visible:outline focus-visible:outline-2 
                                focus-visible:outline-primary"
                        >
                        Guardar
                    </button>
                </div>
                </form>
            </div>
            <div id="confirmacion" data-testid="confirmacion" className={`overflow-hidden ${pedirConfirmacion && !mostrarResultado ? '' : 'max-h-0'}`}>
                <div className="w-full">
                    <h2 className="text-xl font-semibold text-gris-oscuro mb-4 text-center">
                        Esta seguro de que desea cargar esta evolucion?
                    </h2>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => setPedirConfirmacion(false)}
                            className="px-4 py-2 bg-gray-200 rounded-md text-gris hover:bg-gris-claro transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            No, volver
                        </button>
                        <button 
                            onClick={handleConfirmarGuardado}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Si, cargar
                        </button>
                    </div>
                </div>
            </div>
            <div id="resultado" className={`overflow-hidden ${mostrarResultado && !pedirConfirmacion ? '' : 'max-h-0'}`}>
                <div className="w-full">
                    {
                        cargandoEvolucion ?
                        <p className="text-lg font-gris">Cargando... espere por favor.</p>
                        :
                            errorCargaEvolucion ?
                            <h2 className="text-lg font-semibold text-red-500 mb-4 text-center">{errorCargaEvolucion}</h2>
                            :
                            <h2 className="text-lg font-semibold text-primary mb-4 text-center">La evolucion se cargo con exito</h2>
                    }
                    {
                        !cargandoEvolucion &&
                        <div className="flex justify-center gap-4">
                            {
                                errorCargaEvolucion ? 
                                <button 
                                    onClick={() => {setPedirConfirmacion(false); setMostrarResultado(false)}}
                                    className="px-4 py-2 bg-gray-200 rounded-md text-gris hover:bg-gris-claro transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                >
                                    Volver
                                </button>
                                :
                                <button 
                                    onClick={() => {setFormData(initialFormState); goBack()}}
                                    className="px-4 py-2 bg-primary rounded-md text-black hover:bg-secondary transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
                                >
                                    Entendido
                                </button>
                            }
                        </div>
                    }
                </div>
            </div>
        </>
    )
}
