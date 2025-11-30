import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatefulButton from '@/modules/statefulButton';
import CrearEvolucion from '@/modules/historia-clinica/paciente/components/organismos/FormCrearEvolucion';
import userEvent from '@testing-library/user-event';
import useObtenerItemsDM from '@/modules/historia-clinica/hooks/useObtenerItemsDM';

// 1. Mock the module path
jest.mock('@/modules/historia-clinica/hooks/useObtenerItemsDM');
const mockUseObtenerItemsDM = useObtenerItemsDM as jest.Mock;
const mockItemsDM = [
    {
        eje: 1,
        id_item: 1,
        descripcion: 'Item Mockeado 1'
    },
    {
        eje: 2,
        id_item: 2,
        descripcion: 'Item Mockeado 2'
    },
    {
        eje: 3,
        id_item: 3,
        descripcion: 'Item Mockeado 3'
    },
    {
        eje: 4,
        id_item: 4,
        descripcion: 'Item Mockeado 4'
    },
    {
        eje: 5,
        id_item: 5,
        descripcion: 'Item Mockeado 5'
    }
];

describe("CrearEvolucion", () => {
    beforeEach(() => {
        // Limpiar los mocks
        jest.clearAllMocks();
        // Hacemos mock de los items del diagnostico, que originalmente se traen del back
        mockUseObtenerItemsDM.mockReturnValue({
            obtenerItemsDM: jest.fn().mockResolvedValue(mockItemsDM), 
            itemsDM: [],
            isLoading: false,
            error: null,
        });
    });
   it("Deberia impedir la carga si se quiere cargar de inmediato, sin hacer nada", () => {
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    const confirmacion = screen.queryByTestId('confirmacion');
    expect(confirmacion).toHaveClass('max-h-0');
    const botonGuardar = screen.getByText(/Guardar/i);
    fireEvent.click(botonGuardar);
    //El click a guardar no deberia provocar que se muestre la confirmacion porque hay errores
    expect(confirmacion).toHaveClass('max-h-0');
   })

   it("Deberia permitir la carga si la observacion tiene contenido", async () => {
    const user = userEvent.setup()
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    const observacion = screen.getByTestId('observacion');
    //verifico que el estado inicial sea vacio
    expect(observacion).not.toHaveValue();
    //Simulo que el usuario escribe
    await user.type(observacion, 'Esto es una observacion')
    expect(observacion).toHaveValue('Esto es una observacion')
    // Intento guardar
    const botonGuardar = screen.getByText(/Guardar/i);
    fireEvent.click(botonGuardar);
    //El click a guardar muestra el setup de confirmacion
    expect(confirmacion).not.toHaveClass('max-h-0');
   })

   it("al darle click al checkbox cargar diagnostico multiaxial se despliegue un nuevo formulario", async () => {
    const user = userEvent.setup()
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    const checkboxCargarMultiaxial = screen.getByTestId('cargarMultiaxial');
    //Verifico que este sin tildar como estado inicial
    expect(checkboxCargarMultiaxial).not.toBeChecked();
    // Ademas verifico que sin tildar, no se vean las opciones de multiaxial
    const contenedorMultiaxial = screen.getByTestId('divMultiaxial');
    expect(contenedorMultiaxial).toHaveClass('max-h-0'); //Altura 0 para que no se vea esa parte
    //Tildo
    await user.click(checkboxCargarMultiaxial);
    expect(checkboxCargarMultiaxial).toBeChecked();
    // Verifico que ya tildado se vean las opciones del multiaxial
    expect(contenedorMultiaxial).not.toHaveClass('max-h-0'); //Altura 0 para que no se vea esa parte
   })

   it("Deberia impedir la carga si quiere cargar un diagnostico sin ejes", async () => {
    const user = userEvent.setup()
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    // Lleno el campo de observacion para que no sea este input el que impida la carga
    const observacion = screen.getByTestId('observacion');
    await user.type(observacion, 'Esto es una observacion')
    const checkboxCargarMultiaxial = screen.getByTestId('cargarMultiaxial');
    //Tildo
    await user.click(checkboxCargarMultiaxial);
    expect(checkboxCargarMultiaxial).toBeChecked();
    //Ahora intento guardar sin haber provocado otra interaccion con los inputs del multiaxial
    const botonGuardar = screen.getByText(/Guardar/i);
    const confirmacion = screen.queryByTestId('confirmacion');
    fireEvent.click(botonGuardar);
    //El click a guardar no deberia provocar que se muestre la confirmacion porque hay errores
    expect(confirmacion).toHaveClass('max-h-0');
   })
   
   it("No debe permitir la carga si todos los ejes del diagnostico estan llenos pero el campo de observacion no", async () => {
    const user = userEvent.setup()
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    const checkboxCargarMultiaxial = screen.getByTestId('cargarMultiaxial');
    //Tildo
    await user.click(checkboxCargarMultiaxial);
    expect(checkboxCargarMultiaxial).toBeChecked();
    //Lleno cada eje
    const selectoresEje: HTMLElement[] = screen.getAllByRole('combobox');
    await waitFor(() => {
        expect(screen.getByText('(1) Item Mockeado 1')).toBeInTheDocument();
        expect(screen.getByText('(2) Item Mockeado 2')).toBeInTheDocument();
        expect(screen.getByText('(3) Item Mockeado 3')).toBeInTheDocument();
        expect(screen.getByText('(4) Item Mockeado 4')).toBeInTheDocument();
        expect(screen.getByText('(5) Item Mockeado 5')).toBeInTheDocument();
    });
    for (let selector of selectoresEje) {
        await user.selectOptions(selector, selector.children[1].textContent);
    }
    const botonGuardar = screen.getByText(/Guardar/i);
    const confirmacion = screen.queryByTestId('confirmacion');
    fireEvent.click(botonGuardar);
    expect(confirmacion).toHaveClass('max-h-0');
   })
   it("Debe permitir la carga si todos los ejes del diagnostico estan llenos y el campo de observacion tambien", async () => {
    const user = userEvent.setup()
    render(<CrearEvolucion
        goBack={()=>{}}
        evoluciones={[]}
        setEvoluciones={()=>{}}
    />)
    // Lleno el campo de observacion
    const observacion = screen.getByTestId('observacion');
    await user.type(observacion, 'Esto es una observacion')
    const checkboxCargarMultiaxial = screen.getByTestId('cargarMultiaxial');
    //Tildo
    await user.click(checkboxCargarMultiaxial);
    expect(checkboxCargarMultiaxial).toBeChecked();
    //Lleno cada eje
    const selectoresEje: HTMLElement[] = screen.getAllByRole('combobox');
    // Verifico que se hayan llenado los selects con datos del mock
    await waitFor(() => {
        expect(screen.getByText('(1) Item Mockeado 1')).toBeInTheDocument();
        expect(screen.getByText('(2) Item Mockeado 2')).toBeInTheDocument();
        expect(screen.getByText('(3) Item Mockeado 3')).toBeInTheDocument();
        expect(screen.getByText('(4) Item Mockeado 4')).toBeInTheDocument();
        expect(screen.getByText('(5) Item Mockeado 5')).toBeInTheDocument();
    });
    for (let selector of selectoresEje) {
        await user.selectOptions(selector, selector.children[1].textContent);
    }
    const botonGuardar = screen.getByText(/Guardar/i);
    const confirmacion = screen.queryByTestId('confirmacion');
    fireEvent.click(botonGuardar);
    expect(confirmacion).not.toHaveClass('max-h-0');
   })
})