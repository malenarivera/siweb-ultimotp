"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/globals/hooks/useTranslations";
import { useVirtualKeyboard } from "@/globals/hooks/useVirtualKeyboard";
import VirtualKeyboard from "@/globals/components/organismos/VirtualKeyboard";
import PageHeader from "@/globals/components/organismos/PageHeader";
import {useRegistrarPaciente}  from "@/modules/historia-clinica/hooks/useRegistrarPaciente";
import FormField from "@/globals/components/atomos/FormField";
import FormDateField from "@/globals/components/atomos/FormDateField";
import FormSelectField from "@/globals/components/atomos/FormSelectField";
import FormFieldset from "@/globals/components/moleculas/FormFieldset";
import ConfirmationModal from "@/globals/components/moleculas/ConfirmationModal";
import NotificationToast from "@/globals/components/moleculas/NotificationToast";



interface FormData {
  dni: string;
  fechaIngreso: string;
  fehcaNacimiento: string;
  genero: string;
  nombres: string;
  apellido: string;
  obraSocial: string;
  nroSocio: string;
  calle: string;
  numero: string;
  piso: string;
  dpto: string;
  telefono: string;
  email: string;
  fotoPerfil: File | null;
}

interface RegistrarPacienteProps {
  t?: (key: string) => string;
  language?: string;
  changeLanguage?: (lang: 'es' | 'en') => void;
}

export default function RegistrarPaciente({ t: propT, language: propLanguage, changeLanguage: propChangeLanguage }: RegistrarPacienteProps) {
  const { t: hookT, language: hookLanguage, changeLanguage: hookChangeLanguage } = useTranslations();
  const { registrarPaciente, isLoading: saving, error: saveError } = useRegistrarPaciente();

  // Usar props si están disponibles, sino usar hook
  const t = propT || hookT;
  const language = propLanguage || hookLanguage;
  const changeLanguage = propChangeLanguage || hookChangeLanguage;
  
  // Estado inicial alineado con el wireframe y con nombres de clave válidos
  const [formData, setFormData] = useState({
    dni: "",
    fechaIngreso: new Date().toISOString().slice(0, 10), // Fecha de hoy por defecto
    fehcaNacimiento: new Date().toISOString().slice(0, 10),
    genero: "",
    nombres: "",
    apellido: "",
    obraSocial: "",
    nroSocio: "",
    calle: "",
    numero: "",
    piso: "",
    dpto: "",
    telefono: "",
    email: "",
    fotoPerfil: null,
  });
  
  const [showModal, setShowModal] = useState(false);
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isGenderExpanded, setIsGenderExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'error' | 'success';
  }>({
    show: false,
    message: '',
    type: 'error'
  });

  const numericFields = ['dni', 'nroSocio', 'telefono', 'numero', 'piso'];

  // Hook del teclado virtual
  const {
    showVirtualKeyboard,
    setShowVirtualKeyboard,
    activeInput,
    setActiveInput,
    insertText,
    deleteText,
    clearField,
    openKeyboardForField,
  } = useVirtualKeyboard({ formData, setFormData });


  // Función para manejar el focus en los inputs
  const handleInputFocus = (fieldName: string) => {
    setFocusedFields(prev => new Set(prev).add(fieldName));
    setActiveInput(fieldName);
    // No abrir automáticamente el teclado virtual
  };

  // Función para manejar el blur de los inputs
  const handleInputBlur = () => {
    setActiveInput(null);
    // Mantener el teclado abierto por un momento para facilitar la navegación
    setTimeout(() => {
      if (!document.activeElement || !document.activeElement.matches('input, select, button')) {
        setShowVirtualKeyboard(false);
      }
    }, 1000);
  };


  // Función para navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const inputs = document.querySelectorAll('input, select, button[tabindex]');
    const currentIndex = Array.from(inputs).indexOf(e.target as Element);
    
    switch (e.key) {
      case 'Tab':
        // Navegación normal con Tab
        break;
      case 'Enter':
        e.preventDefault();
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
          // Ir al siguiente campo
          const nextInput = inputs[currentIndex + 1] as HTMLElement;
          if (nextInput) {
            nextInput.focus();
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextInputDown = inputs[currentIndex + 1] as HTMLElement;
        if (nextInputDown) {
          nextInputDown.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevInputUp = inputs[currentIndex - 1] as HTMLElement;
        if (prevInputUp) {
          prevInputUp.focus();
        }
        break;
      case 'Escape':
        // Cerrar teclado virtual
        setShowVirtualKeyboard(false);
        setActiveInput(null);
        break;
    }
  };

  // Función para activar el teclado virtual con tecla específica
  const handleVirtualKeyboardToggle = (e: React.KeyboardEvent) => {
    if (e.key === 'F1' || (e.ctrlKey && e.key === 'k')) {
      e.preventDefault();
      setShowVirtualKeyboard(!showVirtualKeyboard);
    }
  };


  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).files?.[0] || null
      }));
    } else if (numericFields.includes(name)) {
      // Solo permitir números en campos numéricos
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Lista de campos requeridos con sus nombres amigables
    const requiredFields: { key: keyof FormData; label: string }[] = [
      { key: 'dni', label: 'DNI' },
      { key: 'nombres', label: 'Nombre' },
      { key: 'apellido', label: 'Apellido' },
      { key: 'genero', label: 'Género' },
      { key: 'email', label: 'Email' },
      { key: 'telefono', label: 'Telefono' }
    ];
    
    // Verificar campos vacíos
    const missingFields = requiredFields.filter(field => !formData[field.key]);
    
    if (missingFields.length > 0) {
      // Crear mensajes de error específicos
      const errors = missingFields.map(field => `El campo ${field.label} es obligatorio`);
      setValidationErrors(errors);
      
      // Mostrar alerta con los campos faltantes
      const errorMessage = `${t('registerPatient.form.validation.requiredFields')}\n\n${errors.join('\n')}`;
      alert(errorMessage);
      
      // Enfocar el primer campo faltante
      const firstMissingField = document.getElementById(missingFields[0].key);
      if (firstMissingField) {
        firstMissingField.focus();
      }
      
      return;
    }
    
    // Si todos los campos requeridos están completos, limpiar errores y mostrar modal de confirmación
    setValidationErrors([]);
    setShowModal(true);
  };
  
const handleConfirmarGuardado = async () => {
  try {
    await registrarPaciente(formData); // Llama al hook para registrar el paciente
    setNotification({ show: true, message: t('registerPatient.form.messages.patientSavedSuccessfully'), type: 'success' });
    setShowModal(false);
    // Opcional: limpiar el formulario o redirigir
    setFormData({
      dni: "",
      fechaIngreso: new Date().toISOString().slice(0, 10),
      fehcaNacimiento: new Date().toISOString().slice(0, 10),
      genero: "",
      nombres: "",
      apellido: "",
      obraSocial: "",
      nroSocio: "",
      calle: "",
      numero: "",
      piso: "",
      dpto: "",
      telefono: "",
      email: "",
      fotoPerfil: null,
    });
  } catch (error) {
    setNotification({ show: true, message: saveError || 'Error al guardar paciente', type: 'error' });
  }
};

  const handleKeyboardNavigation = (isShiftKey: boolean) => {
    const buttons = document.querySelectorAll('[data-keyboard-button="true"]');
    const currentElement = document.activeElement;
    const currentIndex = Array.from(buttons).indexOf(currentElement as Element);
    
    let nextIndex;
    if (isShiftKey) {
      // Navegación hacia atrás
      nextIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
    } else {
      // Navegación hacia adelante
      nextIndex = currentIndex >= buttons.length - 1 ? 0 : currentIndex + 1;
    }
    
    (buttons[nextIndex] as HTMLElement).focus();
  };

  // Agregar este useEffect para manejar el foco inicial
  useEffect(() => {
    if (showVirtualKeyboard) {
      const firstButton = document.querySelector('[data-keyboard-button="true"]') as HTMLElement;
      if (firstButton) {
        firstButton.focus();
      }
    }
  }, [showVirtualKeyboard]);

  return (
    <>
      <div 
        className="max-w-4xl mx-auto"
        onKeyDown={handleKeyDown}
        onKeyUp={handleVirtualKeyboardToggle}
        tabIndex={-1}
      >

        {/* Header */}
          <PageHeader
            title={t("registerPatient.title")}
            description={t("registerPatient.description")}
            breadCrumbConf={
              {
                items:[
                  { label: t("navbar.menus.historiaClinica"), href: "/historia-clinica" },
                  { label: t("registerPatient.title"), isActive: true }
                ],
                t: t
              }
            }
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
              {t('registerPatient.form.title')}
            </h1>
            
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna de Imagen de Perfil */}
                <div className="flex flex-col items-center">
                  <label htmlFor="fotoPerfil" className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                    {t('registerPatient.form.labels.profilePhoto')}
                  </label>
                  <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
                    <span className="text-center text-sm">{t('registerPatient.form.placeholders.enterPhoto')}</span>
                  </div>
                  {/* El input real está oculto pero es accesible vía la etiqueta */}
                  <input type="file" id="fotoPerfil" name="fotoPerfil" className="sr-only" onChange={handleInputChange} accept="image/*"/>
                  
                  {/* Fecha de Ingreso debajo de la imagen */}
                  <div className="mt-6 w-full">
                    <FormDateField
                      id="fechaIngreso"
                      name="fechaIngreso"
                      label={t('registerPatient.form.labels.admissionDate')}
                      value={formData.fechaIngreso}
                      onChange={handleInputChange}
                      required
                      onKeyboardIconClick={() => openKeyboardForField('fechaIngreso')}
                      helpText={t('registerPatient.form.messages.requiredField')}
                      width="full"
                    />
                  </div>
                </div>
                
                {/* Columna principal de datos */}
                <div className="lg:col-span-2 space-y-6">
                   <FormFieldset legend={t('registerPatient.form.labels.personalData')}>
                      <div className="space-y-4 mt-4">
                        {/* Primera fila: DNI solo pero con ancho limitado */}
                        <FormField
                          id="dni"
                          name="dni"
                          label={t('registerPatient.form.labels.dni')}
                          value={formData.dni}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('dni')}
                          onBlur={handleInputBlur}
                          placeholder={t('registerPatient.form.placeholders.enterDni')}
                          required
                          onKeyboardIconClick={() => openKeyboardForField('dni')}
                          isFocused={focusedFields.has('dni')}
                          error={validationErrors.includes('El campo DNI es obligatorio') ? 'El campo DNI es obligatorio' : undefined}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          instructionText={t('registerPatient.form.messages.dniInstructions')}
                          width="half"
                        />



                        {/* Segunda fila: Nombres y Apellido juntos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id="nombres"
                            name="nombres"
                            label={t('registerPatient.form.labels.firstName')}
                            value={formData.nombres}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('nombres')}
                            onBlur={handleInputBlur}
                            placeholder={t('registerPatient.form.placeholders.enterFirstName')}
                            required
                            onKeyboardIconClick={() => openKeyboardForField('nombres')}
                            isFocused={focusedFields.has('nombres')}
                            helpText={t('registerPatient.form.messages.requiredField')}
                            instructionText={t('registerPatient.form.messages.nameInstructions')}
                            width="full"
                          />
                          <FormField
                            id="apellido"
                            name="apellido"
                            label={t('registerPatient.form.labels.lastName')}
                            value={formData.apellido}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('apellido')}
                            placeholder={t('registerPatient.form.placeholders.enterLastName')}
                            required
                            onKeyboardIconClick={() => openKeyboardForField('apellido')}
                            isFocused={focusedFields.has('apellido')}
                            helpText={t('registerPatient.form.messages.requiredField')}
                            instructionText={t('registerPatient.form.messages.nameInstructions')}
                            width="full"
                          />
                        </div>

                        {/* Tercera fila: Género*/}
                        <FormSelectField
                          id="genero"
                          name="genero"
                          label={t('registerPatient.form.labels.gender')}
                          value={formData.genero}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('genero')}
                          onToggleExpanded={() => setIsGenderExpanded(!isGenderExpanded)}
                          onBlur={() => setIsGenderExpanded(false)}
                          options={[
                            { value: 'hombre', label: "Hombre" },
                            { value: 'mujer', label: "Mujer" },
                            { value: 'otro', label: "Otro" },
                          ]}
                          placeholder={focusedFields.has('genero') ? t('registerPatient.form.placeholders.selectGenderOption') : t('registerPatient.form.placeholders.selectGender')}
                          required
                          isFocused={focusedFields.has('genero')}
                          isExpanded={isGenderExpanded}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          width="half"
                        />

                        {/*fechaNac solo pero con ancho limitado */}
                        <FormDateField
                          id="fechaNacimiento"
                          name="fechaNacimiento"
                          label="Fecha Nacimiento"
                          value={formData.fehcaNacimiento}
                          onChange={handleInputChange}
                          placeholder={t('registerPatient.form.placeholders.enterBirthDate')}
                          required
                          showKeyboardIcon={false}
                          isFocused={focusedFields.has('fechaNacimiento')}
                          error={validationErrors.includes('El campo Fecha Nacimiento es obligatorio') ? 'El campo Fecha Nacimiento es obligatorio' : undefined}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          width="half"
                        />

                        {/* Cuarta fila: Obra Social y Nro Socio juntos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id="obraSocial"
                            name="obraSocial"
                            label={t('registerPatient.form.labels.socialWork')}
                            value={formData.obraSocial}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('obraSocial')}
                            placeholder={t('registerPatient.form.placeholders.enterSocialWork')}
                            onKeyboardIconClick={() => openKeyboardForField('obraSocial')}
                            isFocused={focusedFields.has('obraSocial')}
                            instructionText={t('registerPatient.form.messages.nameInstructions')}
                            width="full"
                          />
                          <FormField
                            id="nroSocio"
                            name="nroSocio"
                            label={t('registerPatient.form.labels.memberNumber')}
                            value={formData.nroSocio}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('nroSocio')}
                            placeholder={t('registerPatient.form.placeholders.enterMemberNumber')}
                            onKeyboardIconClick={() => openKeyboardForField('nroSocio')}
                            isFocused={focusedFields.has('nroSocio')}
                            instructionText={t('registerPatient.form.messages.memberNumberInstructions')}
                            width="full"
                          />
                        </div>

                      </div>
                   </FormFieldset>
                   
                    

                   <FormFieldset legend={t('registerPatient.form.labels.contactData')}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Domicilio */}
                        <div className="md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                {/* Calle */}
                                <div className="sm:col-span-6">
                                    <FormField
                                        id="calle"
                                        name="calle"
                                        label={t('registerPatient.form.labels.street')}
                                        value={formData.calle}
                                        onChange={handleInputChange}
                                        onFocus={() => handleInputFocus('calle')}
                                        placeholder={t('registerPatient.form.placeholders.enterStreet')}
                                        onKeyboardIconClick={() => openKeyboardForField('calle')}
                                        isFocused={focusedFields.has('calle')}
                                        showKeyboardIcon={true}
                                        width="full"
                                    />
                                </div>

                                {/* Número */}
                                <div className="sm:col-span-2">
                                    <FormField
                                        id="numero"
                                        name="numero"
                                        label={t('registerPatient.form.labels.number')}
                                        value={formData.numero}
                                        onChange={handleInputChange}
                                        onFocus={() => handleInputFocus('numero')}
                                        placeholder={t('registerPatient.form.placeholders.enterNumber')}
                                        onKeyboardIconClick={() => openKeyboardForField('numero')}
                                        isFocused={focusedFields.has('numero')}
                                        showKeyboardIcon={true}
                                        width="full"
                                    />
                                </div>

                                {/* Piso */}
                                <div className="sm:col-span-2">
                                    <FormField
                                        id="piso"
                                        name="piso"
                                        label={t('registerPatient.form.labels.floor')}
                                        value={formData.piso}
                                        onChange={handleInputChange}
                                        onFocus={() => handleInputFocus('piso')}
                                        placeholder={t('registerPatient.form.placeholders.enterFloor')}
                                        onKeyboardIconClick={() => openKeyboardForField('piso')}
                                        isFocused={focusedFields.has('piso')}
                                        showKeyboardIcon={true}
                                        width="full"
                                    />
                                </div>

                                {/* Departamento */}
                                <div className="sm:col-span-2">
                                    <FormField
                                        id="dpto"
                                        name="dpto"
                                        label={t('registerPatient.form.labels.apartment')}
                                        value={formData.dpto}
                                        onChange={handleInputChange}
                                        onFocus={() => handleInputFocus('dpto')}
                                        placeholder={t('registerPatient.form.placeholders.enterApartment')}
                                        onKeyboardIconClick={() => openKeyboardForField('dpto')}
                                        isFocused={focusedFields.has('dpto')}
                                        showKeyboardIcon={true}
                                        width="full"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{t('registerPatient.form.messages.optionalField')}</p>
                        </div>

                        {/* Teléfono */}
                        <FormField
                          id="telefono"
                          name="telefono"
                          label={t('registerPatient.form.labels.phone')}
                          value={formData.telefono}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('telefono')}
                          placeholder={t('registerPatient.form.placeholders.enterPhone')}
                          type="tel"
                          required
                          onKeyboardIconClick={() => openKeyboardForField('telefono')}
                          isFocused={focusedFields.has('telefono')}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          instructionText="Ingrese solo numeros, sin espacios ni guiones."
                          width="full"
                        />
                        {/* Email*/}
                        <FormField
                          id="email"
                          name="email"
                          label={t('registerPatient.form.labels.email')}
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('email')}
                          placeholder={t('registerPatient.form.placeholders.enterEmail')}
                          type="email"
                          required
                          onKeyboardIconClick={() => openKeyboardForField('email')}
                          isFocused={focusedFields.has('email')}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          instructionText="Debe seguir el formato ejemplo: hola@...com"
                          width="full"
                        />
                      </div>
                   </FormFieldset>
                </div>
              </div>
              
              {/* Botones de acción*/}
              <div className="flex justify-end space-x-4 pt-8">
                <button 
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  {t('registerPatient.form.modal.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-[#5aa382] text-black rounded-md hover:bg-[#5fa6b4] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#69b594]"
                  aria-controls="confirmation-modal"
                  aria-haspopup="dialog"
                >
                  {t('registerPatient.form.buttons.save')}
                </button>
              </div>
            </form>
          </div>
      </div>

     {/*Render del teclado virtual */}
      <VirtualKeyboard
        showKeyboard={showVirtualKeyboard}
        setShowKeyboard={setShowVirtualKeyboard}
        activeInput={activeInput}
        isNumericField={activeInput ? numericFields.includes(activeInput) : false}
        onInsertText={insertText}
        onDeleteText={deleteText}
        onClearField={clearField}
      />

      {/* Modal de Confirmación */}
      <ConfirmationModal
        show={showModal}
        title={t('registerPatient.form.modal.confirmRegistration')}
        message={t('registerPatient.form.modal.confirmSavePatient')}
        confirmLabel={t('registerPatient.form.modal.confirm')}
        cancelLabel={t('registerPatient.form.modal.cancel')}
        onConfirm={handleConfirmarGuardado}
        onCancel={() => setShowModal(false)}
      />

      {/* Componente de Notificación */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        closeLabel={t('registerPatient.form.notifications.close')}
      />
    </>
  );
}

