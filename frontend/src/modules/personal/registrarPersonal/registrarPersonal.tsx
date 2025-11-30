"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/globals/hooks/useTranslations";
import { useVirtualKeyboard } from "@/globals/hooks/useVirtualKeyboard";
import { useRegistrarPersonal } from "../hooks/useRegistrarPersonal";
import VirtualKeyboard from "@/globals/components/organismos/VirtualKeyboard";
import PageHeader from "@/globals/components/organismos/PageHeader";
import FormField from "@/globals/components/atomos/FormField";
import FormDateField from "@/globals/components/atomos/FormDateField";
import FormSelectField from "@/globals/components/atomos/FormSelectField";
import FormFieldset from "@/globals/components/moleculas/FormFieldset";
import ConfirmationModal from "@/globals/components/moleculas/ConfirmationModal";
import NotificationToast from "@/globals/components/moleculas/NotificationToast";


interface FormData {
    tipo:string;
    dni: string;
    nombre: string;
    apellido: string;
    matricula: string;
    genero: string;
    fecha_nacimiento: string;
    email: string;
    foto_url: File | null;
    telefono: string;
}

interface RegistrarPersonalProps {
  t?: (key: string) => string;
  language?: string;
  changeLanguage?: (lang: 'es' | 'en') => void;
}

export default function RegistrarPersonal({ t: propT, language: propLanguage, changeLanguage: propChangeLanguage }: RegistrarPersonalProps) {
  const { t: hookT, language: hookLanguage, changeLanguage: hookChangeLanguage } = useTranslations();
  const { registrarPersonal, isLoading: saving, error: saveError } = useRegistrarPersonal();
  const [pedirMatricula, setPedirMatricula] = useState(false);
  

  // Usar props si están disponibles, sino usar hook
  const t = propT || hookT;
  const language = propLanguage || hookLanguage;
  const changeLanguage = propChangeLanguage || hookChangeLanguage;
  
  // Estado inicial alineado con el wireframe y con nombres de clave válidos
  const [formData, setFormData] = useState({
    tipo: "",
    dni: "",
    nombre: "",
    apellido: "",
    matricula: "",
    genero: "",
    fecha_nacimiento: "",
    email: "",
    telefono: "",
    foto_url: null
  });
  
  const [showModal, setShowModal] = useState(false);
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isGenderExpanded, setIsGenderExpanded] = useState(false);
  const [isProfesionalTypeExpanded, setIsProfesionalTypeExpanded] = useState(false);
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

  const numericFields = ['dni', 'telefono'];

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


  // Componente de ícono de teclado
  const KeyboardIcon = ({ fieldName }: { fieldName: string }) => (
    <button
      type="button"
      onClick={() => openKeyboardForField(fieldName)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openKeyboardForField(fieldName);
        }
      }}
      className="ml-2 p-1 text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded inline-flex items-center"
      aria-label={`Abrir teclado virtual para ${fieldName}`}
      title="Abrir teclado virtual"
       aria-expanded={showVirtualKeyboard && activeInput === fieldName}
      aria-controls="virtual-keyboard"
    >
      ⌨️
    </button>
  );

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

  const clinicos = ['psicologo', 'psiquiatra', 'enfermero'];
  // Funcion para manejar el cambio de tipo o rol del profesional, para pedir o no la matricula
  const handleProfesionalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e);
    let seleccionado = e.target.value;
    let pideMatricula = clinicos.includes(seleccionado)
    setPedirMatricula(pideMatricula);
    if (!pideMatricula)
      setFormData(prev => ({
          ...prev,
          ["matricula"]: ""
      }));
  }

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Lista de campos requeridos con sus nombres amigables
    const requiredFields: { key: keyof FormData; label: string }[] = [
      { key: 'dni', label: 'DNI' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellido', label: 'Apellido' },
      { key: 'genero', label: 'Género' },
      { key: 'matricula', label: 'Matricula' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'email', label: 'Email' }
    ];
    
    // Verificar campos vacíos
    let missingFields = requiredFields.filter(field => !formData[field.key]);
    if (!pedirMatricula)
        missingFields = missingFields.filter(elem => elem.key !== 'matricula');

    if (missingFields.length > 0) {
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
    await registrarPersonal(formData); // Llama al hook para registrar el personal
    setNotification({ show: true, message: "Personal Guardado Exitosamente", type: 'success' });
    setShowModal(false);
    // Opcional: limpiar el formulario o redirigir
    setFormData({
      dni: "",
      fecha_nacimiento: new Date().toISOString().slice(0, 10),
      genero: "",
      nombre: "",
      apellido: "",
      foto_url: null,
      tipo:"",
      matricula:"",
      email:"",
      telefono:"",
    });
  } catch (error) {
    setNotification({ show: true, message: saveError || 'Error al guardar personal', type: 'error' });
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
            title={"Registrar Personal"}
            description={"Gestione la información de nuevo personal en el sistema."}
            breadCrumbConf={
              {
                items:[
                  { label: t("navbar.menus.personal"), href: "/personal" },
                  { label: "Registrar Personal", isActive: true }
                ],
                t: t
              }
            }
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
              Formulario de Registro de Personal
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
                            id="nombre"
                            name="nombre"
                            label={t('registerPatient.form.labels.firstName')}
                            value={formData.nombre}
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
                          id="fecha_nacimiento"
                          name="fecha_nacimiento"
                          label="Fecha Nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleInputChange}
                          placeholder={t('registerPatient.form.placeholders.enterBirthDate')}
                          required
                          showKeyboardIcon={false}
                          isFocused={focusedFields.has('fechaNacimiento')}
                          error={validationErrors.includes('El campo Fecha Nacimiento es obligatorio') ? 'El campo Fecha Nacimiento es obligatorio' : undefined}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          width="half"
                        />

                        {/* Cuarta fila: tipo o rol del profesional*/}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelectField
                          id="tipo"
                          name="tipo"
                          label={"Tipo o Rol del Personal"}
                          value={formData.tipo}
                          onChange={handleProfesionalTypeChange}
                          onFocus={() => handleInputFocus('tipo')}
                          onToggleExpanded={() => setIsProfesionalTypeExpanded(!isProfesionalTypeExpanded)}
                          onBlur={() => setIsProfesionalTypeExpanded(false)}
                          options={[
                            { value: 'psicologo', label: "Psicologo" },
                            { value: 'psiquiatra', label: "Psiquiatra" },
                            { value: 'enfermero', label: "Enfermero" },
                            { value: 'secretaria', label: "Secretaria" },
                            { value: 'director', label: "Director" },
                            { value: 'coordinador', label: "Coordinador" },
                          ]}
                          placeholder={focusedFields.has('tipo') ? "Seleccione una opcion" : "Seleccione aquí el tipo o rol del personal"}
                          required
                          isFocused={focusedFields.has('tipo')}
                          isExpanded={isProfesionalTypeExpanded}
                          helpText={t('registerPatient.form.messages.requiredField')}
                          width="full"
                        />
                        </div>
                        {/* Quinta fila (opcional): matricula SOLO para PSIQ, PSIC, ENF*/}
                        {
                          pedirMatricula && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id="matricula"
                            name="matricula"
                            label={"Matricula"}
                            value={formData.matricula}
                            onChange={handleInputChange}
                            onFocus={() => handleInputFocus('matricula')}
                            placeholder={"Ingrese la matricula"}
                            onKeyboardIconClick={() => openKeyboardForField('matricula')}
                            isFocused={focusedFields.has('matricula')}
                            instructionText={"Ingrese la matricula"}
                            width="full"
                          />
                        </div>
                        }

                      </div>
                   </FormFieldset>
                    

                   <FormFieldset legend={t('registerPatient.form.labels.contactData')}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        
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
        closeLabel={"El personal ha sido creado correctamente"}
      />
    </>
  );
}