"use client";

import { useState } from "react";
import { useTranslations } from "@/globals/hooks/useTranslations";
import { useVirtualKeyboard } from "@/globals/hooks/useVirtualKeyboard";
import { useRouter } from 'next/navigation';
import VirtualKeyboard from "@/globals/components/organismos/VirtualKeyboard";
import PageHeader from "@/globals/components/organismos/PageHeader";
import { useBuscarPacientes } from "@/modules/historia-clinica/hooks/useBuscarPacientes";
import { Paciente } from "@/modules/historia-clinica/types/Paciente";
import Subtitle from "@/globals/components/atomos/Subtitle";
import RadioField from "@/globals/components/atomos/RadioField";
/*De tabla*/
import StripedTable from "@/globals/components/atomos/Table";
import Paginator from "@/globals/components/moleculas/Paginator";

interface FormData {
  nom_ap_dni: string;
  genero: string;
  anio_ingreso_desde: string;
  anio_ingreso_hasta: string;
  limit: number;
  page: number;
  order: string;
  sort: string;
  /* Estos se comentan porque la API no los procesa todavia */
  /*diagnostico: string;
  profesional: string;
  medicacion: string;*/
}

interface BuscarPacienteProps {
  t?: (key: string) => string;
  language?: string;
  changeLanguage?: (lang: 'es' | 'en') => void;
}

export default function BuscarPaciente({ t: propT, language: propLanguage, changeLanguage: propChangeLanguage }: BuscarPacienteProps) {
  const router = useRouter();
  const { t: hookT, language: hookLanguage, changeLanguage: hookChangeLanguage } = useTranslations();
  // Usar props si están disponibles, sino usar hook
  const t = propT || hookT;
  const language = propLanguage || hookLanguage;
  const changeLanguage = propChangeLanguage || hookChangeLanguage;
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState<boolean>(false);
  const { buscarPacientes, pacientes, getTotalPages, isLoading, error } = useBuscarPacientes();
  const [sort, setSort] = useState<string>("apellido");
  const [order, setOrder] = useState<string>("asc");
  const [formData, setFormData] = useState<FormData>({
    nom_ap_dni: "",
    genero: "",
    anio_ingreso_desde: "",
    anio_ingreso_hasta: "",
    limit: 5,
    page: 1,
    order: "asc",
    sort: "apellido"

    /*
    diagnostico: "",
    profesional: "",
    medicacion: "",
    */
  });

  const numericFields = ["anio_ingreso_desde", "anio_ingreso_hasta"];
  const handleGeneroChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      genero: value,
    }));
  };

  const generoOptions = [
    { id: "inputNoEspecificarGenero", label: "Sin Especificar", value: "" },
    { id: "inputMujer", label: "Mujer", value: "mujer" },
    { id: "inputHombre", label: "Hombre", value: "hombre" },
    { id: "inputOtro", label: "Otro", value: "otro" },
  ];


  // 👉 Hook del teclado virtual
  const {
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    activeInput,
    insertText,
    deleteText,
    clearField,
    openKeyboardForField,
  } = useVirtualKeyboard({ formData, setFormData });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (numericFields.includes(name) && !/^\d*$/.test(value)) {
      return;
    }
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const datos = {...formData};
    datos.order = "asc"; 
    datos.sort = "apellido";
    datos.page = 1;
    setSort(datos.sort);
    setOrder(datos.order);
    await buscarPacientes(datos);
    setFormData(datos);
    setSearched(true);
  };

  const handlePageChange = async (pagenum: number) => {
    const totalPages = getTotalPages(formData.limit);
    if(pagenum > totalPages || pagenum < 1)
      return;
    const datos = {...formData};
    datos.order = order;
    datos.sort = sort;
    datos.page = pagenum;
    await buscarPacientes(datos);
    setFormData(datos);
  };

  const handleSortChange = async (sort: string, order: string) => {
    const datos = {...formData};
    datos.page = 1; // Reiniciamos la pagina si cambia el sort y esta por ej en la pagina 2
    datos.order = order;
    datos.sort = sort;
    setSort(datos.sort);
    setOrder(datos.order);
    await buscarPacientes(datos);
    setFormData(datos);
  };

  // 📌 Ícono del teclado junto a cada input
  const KeyboardIcon = ({ fieldName }: { fieldName: string }) => (
    <button
      type="button"
      onClick={() => openKeyboardForField(fieldName)}
      className="ml-2 p-1 text-sm text-gray-500 hover:text-[#5fa6b4] focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] rounded inline-flex items-center"
      aria-label={t("registerPatient.form.virtualKeyboard.openKeyboard")}
      title={t("registerPatient.form.virtualKeyboard.openKeyboard")}
    >
      ⌨️
    </button>
  );

  const tableContentConfig = [
    {
      columnName: "ID",
      key: "id_usuario",
      isId: true,
      sorts: false,
      draw: false
    },
    {
      columnName: "DNI",
      key: "dni",
      isId: false,
      sorts: false,
      draw: true
    },
    {
      columnName: "Apellido",
      key: "apellido",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Nombre",
      key: "nombre",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Genero",
      key: "genero",
      isId: false,
      sorts: false,
      draw: true
    },
    {
      columnName: "Fecha de Ingreso",
      key: "fecha_ingreso",
      isId: false,
      sorts: true,
      formatFunction: (elem: any) => new Date(elem).toLocaleDateString('en-GB'),
      draw: true,
    },
  ]

  const tableSortConfig = {
    currentSort: sort,
    currentOrder: order,
    sortHandler: handleSortChange
  }

  const rowClickAction = (row: Paciente) => {
    router.push(`/paciente?id=${row.id_usuario}`);
  };

  return (
    <>
      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-6 py-3">
          {/* Header */}
          <PageHeader
            title={t("searchPatient.title")}
            description={t("searchPatient.description")}
            breadCrumbConf={
              {
                items:[
                  { label: t("navbar.menus.historiaClinica"), href: "/historia-clinica" },
                  { label: t("searchPatient.title"), isActive: true }
                ],
                t: t
              }
            }
          />

        <form
          id="formulario-busqueda"
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-lg p-6 border border-gray-200"
        >
          {/* Campo principal */}
          <div>
            <label
              htmlFor="paciente"
              className="block text-sm font-medium text-gray-700"
            >
              {t("searchPatient.form.patient")}
            </label>
            <div className="mt-1 flex">
              <input
                id="paciente"
                name="nom_ap_dni"
                type="text"
                value={formData.nom_ap_dni}
                onChange={handleInputChange}
                placeholder={t("searchPatient.form.placeholders.search")}
                className="flex-1 border rounded-l-lg px-3 py-2 text-gray-900 
                           placeholder-gray-700 focus:outline-none 
                           focus:ring-2 focus:ring-accent"
              />
              <KeyboardIcon fieldName="nom_ap_dni" />     
            </div>
          </div>

          {/* Botón filtros avanzados */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 text-green-700 underline text-sm"
          >
            {showFilters
              ? t("searchPatient.form.hideFilters")
              : t("searchPatient.form.advancedFilters")}
          </button>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4">
              {/* Genero */}
              <RadioField
                legend={t("searchPatient.form.gender.label")}
                name="genero"
                options={generoOptions}
                selectedValue={formData.genero}
                onChange={handleGeneroChange}
                className="w-1/2"
              />

              {/* Año ingreso */}
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("searchPatient.form.yearOfAdmission")}
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    name="anio_ingreso_desde"
                    value={formData.anio_ingreso_desde}
                    onChange={handleInputChange}
                    placeholder={t("searchPatient.form.placeholders.yearFrom")}
                    className="w-1/2 border rounded-lg px-3 py-2 placeholder-gray-700"
                  />
                  <KeyboardIcon fieldName="anio_ingreso_desde" />
                  <span className="inline-flex items-center text-4xl"> - </span>
                  <input
                    type="text"
                    name="anio_ingreso_hasta"
                    value={formData.anio_ingreso_hasta}
                    onChange={handleInputChange}
                    placeholder={t("searchPatient.form.placeholders.yearTo")}
                    className="w-1/2 border rounded-lg px-3 py-2 placeholder-gray-700"
                  />
                  <KeyboardIcon fieldName="anio_ingreso_hasta" />
                </div>
              </div>

              {/* Diagnóstico 
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("searchPatient.form.diagnosis")}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    placeholder={t("searchPatient.form.placeholders.diagnosis")}
                    className="mt-1 w-full border rounded-lg px-3 py-2 placeholder-gray-700"
                  />
                  <KeyboardIcon fieldName="diagnostico" />
                </div>
              </div>
              */}
              {/* Profesional 
              <div>
                <label className="block text-sm font-medium text-black">
                  {t("searchPatient.form.professional")}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="profesional"
                    value={formData.profesional}
                    onChange={handleInputChange}
                    placeholder={t(
                      "searchPatient.form.placeholders.professional"
                    )}
                    className="mt-1 w-full border rounded-lg px-3 py-2 placeholder-gray-700"
                  />
                  <KeyboardIcon fieldName="profesional" />
                </div>
              </div>
                */}
              {/* Medicación 
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black">
                  {t("searchPatient.form.medication")}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="medicacion"
                    value={formData.medicacion}
                    onChange={handleInputChange}
                    placeholder={t(
                      "searchPatient.form.placeholders.medication"
                    )}
                    className="mt-1 w-full border rounded-lg px-3 py-2 placeholder-gray-700"
                  />
                  <KeyboardIcon fieldName="medicacion" />
                </div>
              </div>*/}
            </div>
          )}

          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 
                     transition-all duration-200 focus-visible:outline focus-visible:outline-2 
                     focus-visible:outline-gray-600"
            >
              {t("common.back", )}
            </button>
            <button
              className="px-6 py-2 rounded-lg flex items-center transition-all duration-200 
                     bg-[#5fa6b4] text-black hover:bg-[#5fa6b4]/80 
                     focus-visible:outline focus-visible:outline-2 
                     focus-visible:outline-[#5fa6b4]"
            >
              {t("searchPatient.form.searchButton")} 
              <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
        <div className="my-5 mx-2">
          {isLoading && <p>Cargando...</p>}
          {error && <p className="text-red-500 text-lg">Error: {error}</p>}
          {!isLoading && !error && searched && pacientes.length > 0 ? 
            <div className="flex flex-col">
            <Subtitle subtitle="Resultados"/>
            <StripedTable
              data={pacientes}
              className="mb-5 mt-2"
              contentConfig={tableContentConfig}
              sortConfig={tableSortConfig}
              rowAction={rowClickAction}
            />
            <Paginator 
              totalPages={getTotalPages(formData.limit)}
              currentPage={formData.page}
              pageClickHandler={handlePageChange}
            />
          </div>
          : searched && !isLoading && !error && pacientes.length === 0 && (
            <p>Su consulta no produjo resultados.</p>
          )
          }
        </div>
      </div>

      {/* 📌 Render del teclado virtual */}
      <VirtualKeyboard
        showKeyboard={showVirtualKeyboard}
        setShowKeyboard={setShowVirtualKeyboard}
        activeInput={activeInput}
        isNumericField={activeInput ? numericFields.includes(activeInput) : false}
        onInsertText={insertText}
        onDeleteText={deleteText}
        onClearField={clearField}
      />
    </>
  );
}
