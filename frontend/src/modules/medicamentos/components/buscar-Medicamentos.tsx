"use client";

import { useState } from "react";
import { useTranslations } from "@/globals/hooks/useTranslations";
import { useVirtualKeyboard } from "@/globals/hooks/useVirtualKeyboard";
import { useRouter } from 'next/navigation';
import VirtualKeyboard from "@/globals/components/organismos/VirtualKeyboard";
import PageHeader from "@/globals/components/organismos/PageHeader";
import { useBuscarMedicamentos } from "@/modules/medicamentos/hooks/useBuscarMedicamentos";
import RadioField from "@/globals/components/atomos/RadioField";
import { buildFormaFarmaceuticaOptions } from "@/modules/medicamentos/const/const";
import Subtitle from "@/globals/components/atomos/Subtitle";
/*De tabla*/
import StripedTable from "@/globals/components/atomos/Table";
import Paginator from "@/globals/components/moleculas/Paginator";
import { Medicamento } from "@/modules/medicamentos/types/Medicamento";
import { MedicationIntakeModal } from "@/modules/medicamentos/components/modalIngreso";
import { MedicationWithdrawalModal } from "@/modules/medicamentos/components/modalEgreso";
import { useIngresoMedicamento } from "@/modules/medicamentos/hooks/useIngresoMedicamento";
import { useEgresoMedicamento } from "@/modules/medicamentos/hooks/useEgresoMedicamento";

interface FormData {
  nomCom_NomGene: string;
  laboratorio_titular: string;
  concentracion: string;
  forma_farmaceutica: string;
  presentacion: string;
  limit: number;
  page: number;
  order: string;
  sort: string;
}

type MedicationMovementFormValues = {
  id_paciente: number;
  id_profesional: number;
  cantidad: number;
  motivo: string;
};

interface BuscarMedicamentoProps {
  t?: (key: string) => string;
  language?: string;
  changeLanguage?: (lang: 'es' | 'en') => void;
}

export default function BuscarMedicamento({ t: propT, language: propLanguage, changeLanguage: propChangeLanguage }: BuscarMedicamentoProps) {
  const router = useRouter();
  const { t: hookT, language: hookLanguage, changeLanguage: hookChangeLanguage } = useTranslations();
  // Usar props si están disponibles, sino usar hook
  const t = propT || hookT;
  const language = propLanguage || hookLanguage;
  const changeLanguage = propChangeLanguage || hookChangeLanguage;
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState<boolean>(false);
  const { buscarMedicamentos, medicamentos, getTotalPages, isLoading, error } = useBuscarMedicamentos();
  const [sort, setSort] = useState<string>("stock");
  const [order, setOrder] = useState<string>("desc");
  const [selectedMedicationForIngreso, setSelectedMedicationForIngreso] = useState<Medicamento | null>(null);
  const [selectedMedicationForEgreso, setSelectedMedicationForEgreso] = useState<Medicamento | null>(null);
  const { registrarIngresoMedicamento } = useIngresoMedicamento();
  const { registrarEgresoMedicamento } = useEgresoMedicamento();
  const [formData, setFormData] = useState<FormData>({
    nomCom_NomGene: "",
    laboratorio_titular: "",
    concentracion: "",
    forma_farmaceutica: "",
    presentacion: "",
    limit: 10,
    page: 1,
    order: "desc",
    sort: "stock"

    /*
    diagnostico: "",
    profesional: "",
    medicacion: "",
    */
  });

  const numericFields: string[] = [];

  const handleFormaFarmaceuticaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      forma_farmaceutica: value,
    }));
  };

  const openIngresoModal = (medicamento: Medicamento) => {
    setSelectedMedicationForIngreso(medicamento);
  };

  const openEgresoModal = (medicamento: Medicamento) => {
    setSelectedMedicationForEgreso(medicamento);
  };

  const closeIngresoModal = () => {
    setSelectedMedicationForIngreso(null);
  };

  const closeEgresoModal = () => {
    setSelectedMedicationForEgreso(null);
  };

  const handleMedicationIntakeSubmit = async (medicamento: Medicamento, data: MedicationMovementFormValues) => {
    await registrarIngresoMedicamento({
      id_medicamento: medicamento.id_medicamento,
      id_paciente: data.id_paciente,
      id_profesional: data.id_profesional,
      cantidad: data.cantidad,
      motivo: data.motivo,
    });
    closeIngresoModal();
    await buscarMedicamentos({ ...formData });
  };

  const handleMedicationWithdrawalSubmit = async (medicamento: Medicamento, data: MedicationMovementFormValues) => {
    await registrarEgresoMedicamento({
      id_medicamento: medicamento.id_medicamento,
      id_paciente: data.id_paciente,
      id_profesional: data.id_profesional,
      cantidad: data.cantidad,
      motivo: data.motivo,
    });
    closeEgresoModal();
    await buscarMedicamentos({ ...formData });
  };

  const formaFarmaceuticaOptions = buildFormaFarmaceuticaOptions({
    selectedValue: formData.forma_farmaceutica,
    onChange: handleFormaFarmaceuticaChange,
  });

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
    const datos = { ...formData };
    datos.order = "desc";
    datos.sort = "stock";
    datos.page = 1;
    setSort(datos.sort);
    setOrder(datos.order);
    await buscarMedicamentos(datos);
    setFormData(datos);
    setSearched(true);
  };

  const handlePageChange = async (pagenum: number) => {
    const totalPages = getTotalPages(formData.limit);
    if (pagenum > totalPages || pagenum < 1)
      return;
    const datos = { ...formData };
    datos.order = order;
    datos.sort = sort;
    datos.page = pagenum;
    await buscarMedicamentos(datos);
    setFormData(datos);
  };

  const handleSortChange = async (sort: string, order: string) => {
    const datos = { ...formData };
    datos.page = 1; // Reiniciamos la pagina si cambia el sort y esta por ej en la pagina 2
    datos.order = order;
    datos.sort = sort;
    setSort(datos.sort);
    setOrder(datos.order);
    await buscarMedicamentos(datos);
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
      key: "id_medicamento",
      isId: true,
      sorts: false,
      draw: false
    },
    {
      columnName: "Nombre Comercial",
      key: "nombre_comercial",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Nombre Genérico",
      key: "nombre_generico",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Laboratorio",
      key: "laboratorio_titular",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Concentración",
      key: "concentracion",
      isId: false,
      sorts: true,
      draw: true,
    },
    {
      columnName: "Forma Farmacéutica",
      key: "forma_farmaceutica",
      isId: false,
      sorts: false,
      draw: true
    },
    {
      columnName: "Presentación",
      key: "presentacion",
      isId: false,
      sorts: false,
      draw: true
    },
    {
      columnName: "Stock",
      key: "stock",
      isId: false,
      sorts: true,
      draw: true
    },
    {
      columnName: "Fecha de creación",
      key: "fecha_creacion",
      isId: false,
      sorts: true,
      formatFunction: (elem: string) => new Date(elem).toLocaleDateString('es-AR'),
      draw: true,
    },
  ]

  const tableSortConfig = {
    currentSort: sort,
    currentOrder: order,
    sortHandler: handleSortChange
  }

  const rowClickAction = (row: Medicamento) => {
    router.push(`/medicamentos/${row.id_medicamento}`);
  };

  return (
    <>
      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-6 py-3">
        {/* Header */}
        <PageHeader
          title="Buscar Medicamento"
          description="Busque y seleccione un medicamento para acceder a sus datos"
          breadCrumbConf={
            {
              items: [
                { label: "MEDICAMENTOS" },
                { label: "INVENTARIO", isActive: true }
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
              htmlFor="medicamento"
              className="block text-sm font-medium text-gray-700"
            >
              Medicamento
            </label>
            <div className="mt-1 flex">
              <input
                id="medicamento"
                name="nomCom_NomGene"
                type="text"
                value={formData.nomCom_NomGene}
                onChange={handleInputChange}
                placeholder="Ingrese nombre comercial o genérico"
                className="flex-1 border rounded-l-lg px-3 py-2 text-gray-900 
                          focus:outline-none 
                           focus:ring-2 focus:ring-accent"
              />
              <KeyboardIcon fieldName="nomCom_NomGene" />
            </div>
          </div>

          {/* Botón filtros avanzados */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 text-green-700 underline text-sm"
          >
            {showFilters
              ? "Ocultar filtros avanzados"
              : "Filtros avanzados"}
          </button>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Laboratorio titular
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    name="laboratorio_titular"
                    value={formData.laboratorio_titular}
                    onChange={handleInputChange}
                    placeholder="CELNOVA ARGENTINA S.A."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <KeyboardIcon fieldName="laboratorio_titular" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Concentración
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    name="concentracion"
                    value={formData.concentracion}
                    onChange={handleInputChange}
                    placeholder="250 MG"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <KeyboardIcon fieldName="concentracion" />
                </div>
              </div>

              <RadioField
                legend="Forma farmacéutica"
                name="forma_farmaceutica"
                options={formaFarmaceuticaOptions}
                selectedValue={formData.forma_farmaceutica}
                onChange={handleFormaFarmaceuticaChange}
              />

              <div>
                <label className="block text-sm font-medium text-black">
                  Presentación
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    name="presentacion"
                    value={formData.presentacion}
                    onChange={handleInputChange}
                    placeholder="30 COMPRIMIDOS RECUBIERTOS"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <KeyboardIcon fieldName="presentacion" />
                </div>
              </div>
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
              {t("common.back",)}
            </button>
            <button
              className="px-6 py-2 rounded-lg flex items-center transition-all duration-200 
                     bg-[#5fa6b4] text-black hover:bg-[#5fa6b4]/80 
                     focus-visible:outline focus-visible:outline-2 
                     focus-visible:outline-[#5fa6b4]"
            >
              {t("searchPatient.form.searchButton")}
              <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
        <div className="my-5 mx-2">
          {isLoading && <p>Cargando...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

        </div>
      </div>
      {!isLoading && !error && searched && medicamentos.length > 0 ?
        <div className="flex flex-col  max-w-4xl mx-auto items-center mb-12">
          <Subtitle subtitle="Resultados" />
          <StripedTable
            data={medicamentos}
            className="mb-5 mt-2"
            contentConfig={tableContentConfig}
            sortConfig={tableSortConfig}
            rowAction={rowClickAction}
            showMedicationActions={true}
            onMedicationAdd={openIngresoModal}
            onMedicationRemove={openEgresoModal}
          />
          <Paginator
            totalPages={getTotalPages(formData.limit)}
            currentPage={formData.page}
            pageClickHandler={handlePageChange}
          />
        </div>
        : searched && !isLoading && !error && medicamentos.length === 0 && (
          <p className="text-center mb-12">Su consulta no produjo resultados.</p>
        )
      }

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
      {selectedMedicationForIngreso && (
        <MedicationIntakeModal
          medicamento={selectedMedicationForIngreso}
          onClose={closeIngresoModal}
          onSubmit={handleMedicationIntakeSubmit}
        />
      )}
      {selectedMedicationForEgreso && (
        <MedicationWithdrawalModal
          medicamento={selectedMedicationForEgreso}
          onClose={closeEgresoModal}
          onSubmit={handleMedicationWithdrawalSubmit}
        />
      )}
    </>
  );
}
