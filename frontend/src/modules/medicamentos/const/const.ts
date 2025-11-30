import React from "react";
import NestedRadioOptions, {
  NestedRadioOption,
} from "@/globals/components/atomos/NestedRadioOptions";
import { RadioOption } from "@/globals/components/atomos/RadioField";

export const TIPOS_COMPRIMIDO: NestedRadioOption[] = [
  { value: "COMPRIMIDO", label: "Comprimido" },
  { value: "COMPRIMIDO RECUBIERTO", label: "Comprimido Recubierto" },
  { value: "COMPRIMIDO MASTICABLE", label: "Comprimido Masticable" },
  { value: "COMPRIMIDO RANURADO VAGINAL", label: "Comprimido Ranurado Vaginal" },
  { value: "COMPRIMIDO DE LIBERACIÓN PROLONGADA", label: "Comprimido de liberación prolongada" },
];

export const TIPOS_CAPSULA: NestedRadioOption[] = [
  { value: "CÁPSULA DURA", label: "Cápsula Dura" },
  { value: "CÁPSULA BLANDA", label: "Cápsula Blanda" },
  { value: "CÁPSULA CON MICROGRANULOS DE LIBERACIÓN PROLONGADA", label: "Cápsula con Microgranulos de Liberacion Prolongada" },
];

export const TIPOS_POLVO: NestedRadioOption[] = [
  { value: "POLVO GRANULADO PARA SUSPENSIÓN ORAL", label: "Polvo granulado para suspensión oral" },
  { value: "POLVO LIOFILIZADO INYECTABLE", label: "Polvo liofilizado inyectable" },
];

export const TIPOS_SUSPENSION: NestedRadioOption[] = [
  { value: "SUSPENSIÓN ORAL", label: "Suspensión oral" },
  { value: "SUSPENSIÓN OFTÁLMICA ESTÉRIL", label: "Suspensión oftálmica estéril" },
];

export const TIPOS_INYECTABLE: NestedRadioOption[] = [
  { value: "INYECTABLE", label: "Inyectable" },
  { value: "SOLUCIÓN INYECTABLE", label: "Solución inyectable" },
  { value: "SOLUCIÓN PARA INHALAR", label: "Solución para inhalar" },
  { value: "SPRAY BUCAL", label: "Spray bucal" },
];

export const TIPOS_TOPICO: NestedRadioOption[] = [
  { value: "CREMA", label: "Crema" },
];

interface BuildOptionsParams {
  selectedValue: string;
  onChange: (value: string) => void;
}

const renderNestedOptions = (
  options: NestedRadioOption[],
  selectedValue: string,
  onChange: (value: string) => void
): React.ReactNode =>
  React.createElement(NestedRadioOptions, {
    name: "forma_farmaceutica",
    options,
    selectedValue,
    onChange,
  });

export const buildFormaFarmaceuticaOptions = ({
  selectedValue,
  onChange,
}: BuildOptionsParams): RadioOption[] => [
  { id: "formaSinEspecificar", label: "Sin especificar", value: "" },
  {
    id: "formaComprimido",
    label: "Comprimidos",
    value: "COMPRIMIDO",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_COMPRIMIDO,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
  {
    id: "formaCapsula",
    label: "Cápsulas",
    value: "CAPSULA",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_CAPSULA,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
  {
    id: "formaPolvo",
    label: "Polvo",
    value: "POLVO",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_POLVO,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
  {
    id: "formaSuspension",
    label: "Suspensión",
    value: "SUSPENSION",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_SUSPENSION,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
  {
    id: "formaInyectable",
    label: "Inyectable",
    value: "INYECTABLE",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_INYECTABLE,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
  {
    id: "formaTopico",
    label: "Tópico",
    value: "TOPICO",
    renderExtra: () =>
      renderNestedOptions(
        TIPOS_TOPICO,
        selectedValue,
        onChange
      ),
    isGroup: true,
  },
];

