"use client";
import { useState } from 'react';
import { useTranslations } from "@/globals/hooks/useTranslations";
import PageHeader from "@/globals/components/organismos/PageHeader";
import PatientCard from "./organismos/PatientCard";
import PatientEvolutionHeader from "./moleculas/PatientEvolutionHeader";
import MultiaxialCard from "./organismos/MultiaxialCard";
import EvolucionCard from "./organismos/EvolucionCard";
import CorreccionCard from "./organismos/CorreccionCard";
import RecetaCard from "./organismos/RecetaCard";
import SOTCard from "./organismos/SOTCard";
import useEvoluciones from '@/modules/historia-clinica/hooks/useEvoluciones';
import useSots from '@/modules/historia-clinica/hooks/useSots';
import usePaciente from '@/modules/historia-clinica/hooks/usePaciente';
import { EvolucionCompleta } from '../../types/EvolucionCompleta';
import { useSearchParams } from 'next/navigation';

interface Props {
  t?: (key: string) => string;
  /** id_usuario used to fetch evoluciones from the API */
  id_usuario?: string | number;
}

export default function HistoriaClinicaPaciente({ t: propT, id_usuario: propId }: Props) {
  const searchParams = useSearchParams();
  const [sortNewestFirst, setSortNewestFirst] = useState<boolean>(true);
  const { t: hookT } = useTranslations();
  const t = propT || hookT;
  // use hook to fetch evoluciones from API; fallback demo id 9 when prop not provided
  const id_usuario = propId ?? searchParams.get('id');
  const { data: evolucionesData, isLoading, error, reload, setData: setEvoluciones } = useEvoluciones(id_usuario);
  const evoluciones = evolucionesData ?? [];
  const { data: sotsData, error: errorSot, isLoading: isLoadingSOT } = useSots(id_usuario);
  const sots = sotsData ?? [];

  // fetch patient data from API
  const { data: pacienteData, isLoading: pacienteLoading, error: pacienteError } = usePaciente(id_usuario);
  // map API shape to the `PatientCard` expected shape and provide fallbacks

  if (pacienteLoading || (!pacienteError && !pacienteData)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando datos del paciente...</p>
      </div>
    )
  }
  if (pacienteError) {
   return (
    <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl mx-20 text-center">{pacienteError}</p>
    </div>
   )
  } 

  const patientData = {
        name: `${pacienteData.nombre ?? ''} ${pacienteData.apellido ?? ''}`.trim(),
        dni: pacienteData.dni ?? undefined,
        sexo: pacienteData.genero ?? undefined,
        nacimiento: pacienteData.fecha_nacimiento ? new Date(pacienteData.fecha_nacimiento).toLocaleDateString() : undefined,
        obraSocial: pacienteData.obra_social ?? undefined,
        ingreso: pacienteData.fecha_ingreso ? new Date(pacienteData.fecha_ingreso).toLocaleDateString() : undefined,
        domicilio: pacienteData.domicilio ?? undefined,
        telefono: pacienteData.telefono ?? undefined,
        email: pacienteData.email ?? undefined,
        foto_url: pacienteData.foto_url ?? undefined,
  }
  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto px-6 py-3">
        <PageHeader
          /* Breadcrumb + green line above the card */
          breadCrumbConf={{
            items: [
              { label: t ? t("navbar.menus.historiaClinica") : "Historia Clínica" },
              { label: t ? t("searchPatient.title") : "Buscar Paciente" },
              { label: patientData?.name || (t ? t("patient.name") : "Paciente"), isActive: true },
            ],
            t: t,
          }}
        />

        <PatientCard t={t} data={patientData} />

  <PatientEvolutionHeader id_usuario={id_usuario} evoluciones={evoluciones} setEvoluciones={setEvoluciones} sortNewestFirst={sortNewestFirst} onRightClick={() => setSortNewestFirst(s => !s)} />

        {(isLoading || isLoadingSOT)&& <div className="py-4 text-sm text-gray-600">Cargando Historia Clinica...</div>}
        {(error || errorSot) && <div className="py-4 text-xl text-red-500">{`No se pudo cargar la historia clinica completa: ${(error || errorSot)}`}</div>}

        {/* Group evolutions by their diagnostico multiaxial (if present) */}
        {
          // collect diagnostics and map evolutions under them
          (() => {
            // For testing: assign distinct, deterministic timestamps so ordering is easy to verify.
            // Toggle this flag to false to stop overriding API dates.
            const DEBUG_ASSIGN_DISTINCT_DATES = true;

            const evolucionesForSort: any[] = DEBUG_ASSIGN_DISTINCT_DATES && evoluciones.length > 0
              ? evoluciones.map((ev, i) => {
                  // Give each evolution a unique timestamp spaced by 1 day descending (newest for index 0)
                  const base = Date.now();
                  const dayMs = 24 * 60 * 60 * 1000;
                  const ts = new Date(base - i * dayMs).toISOString();
                  // also update the diagnostico.creacion.fecha when present so DM reflects the same test date
                  const newDiagnostico = ev.diagnostico
                    ? { ...(ev.diagnostico ?? {}), creacion: { ...((ev.diagnostico as any).creacion ?? {}), fecha: ts } }
                    : ev.diagnostico;
                  return { ...ev, creacion: { ...(ev.creacion ?? {}), fecha: ts }, diagnostico: newDiagnostico };
                })
              : evoluciones;

            // sort evoluciones by `creacion.fecha` (ISO) descending so newest items appear first
            const sortedEvolucionesDesc = [...evolucionesForSort].sort((a, b) => {
              const at = a?.creacion?.fecha ? Date.parse(String(a.creacion.fecha)) : 0;
              const bt = b?.creacion?.fecha ? Date.parse(String(b.creacion.fecha)) : 0;
              return bt - at;
            });
            const sortedEvoluciones = sortNewestFirst ? sortedEvolucionesDesc : [...sortedEvolucionesDesc].reverse();

            // Build DM entries (unique) with their creation timestamps
            const dmEntries: Array<{ key: string | number; diagnostico: any; fechaMs: number }> = [];
            const dmSeen = new Set<string | number>();
            sortedEvoluciones.forEach(ev => {
              const dm = ev.diagnostico;
              if (dm && dm.id_diagnostico_multiaxial !== undefined && dm.id_diagnostico_multiaxial !== null) {
                const key = dm.id_diagnostico_multiaxial;
                if (!dmSeen.has(key)) {
                  dmSeen.add(key);
                  const fechaStr = dm.creacion?.fecha ?? ev.creacion?.fecha ?? null;
                  const fechaMs = fechaStr ? Date.parse(String(fechaStr)) : 0;
                  dmEntries.push({ key, diagnostico: dm, fechaMs });
                }
              }
            });

            // sort DM entries by their fecha according to current direction
            dmEntries.sort((a, b) => sortNewestFirst ? (b.fechaMs - a.fechaMs) : (a.fechaMs - b.fechaMs));

            // create map in that order (items will hold both evoluciones and sots)
            const dmMap = new Map<string | number, { diagnostico: any; items: Array<{ kind: 'evolucion' | 'sot'; data: any }> }>();
            for (const e of dmEntries) dmMap.set(e.key, { diagnostico: e.diagnostico, items: [] as any });

            const withoutDm: Array<{ kind: 'evolucion' | 'sot'; data: any }> = [];

            // assign each evolution: if it has DM, push to that DM; otherwise find the DM whose fecha is the closest smaller-or-equal to the evolution fecha
            const dmListForSearch = dmEntries; // sorted according to sortNewestFirst

            // iterate using the evoluciones order (which itself may be reversed based on sortNewestFirst)
            const evolucionesToAssign = sortedEvoluciones;

            evolucionesToAssign.forEach(ev => {
              const dm = ev.diagnostico;
              if (dm && dm.id_diagnostico_multiaxial !== undefined && dm.id_diagnostico_multiaxial !== null) {
                const key = dm.id_diagnostico_multiaxial;
                if (!dmMap.has(key)) dmMap.set(key, { diagnostico: dm, items: [] as any });
                dmMap.get(key)!.items.push({ kind: 'evolucion', data: ev });
              } else {
                // find closest DM with fechaMs <= evFecha
                const evFechaMs = ev.creacion?.fecha ? Date.parse(String(ev.creacion.fecha)) : 0;
                let chosenKey: string | number | null = null;
                let chosenDiff = Number.POSITIVE_INFINITY;
                for (const entry of dmListForSearch) {
                  if (entry.fechaMs <= evFechaMs) {
                    const diff = evFechaMs - entry.fechaMs;
                    if (diff < chosenDiff) {
                      chosenDiff = diff;
                      chosenKey = entry.key;
                    }
                  }
                }
                if (chosenKey !== null && dmMap.has(chosenKey)) {
                  dmMap.get(chosenKey)!.items.push({ kind: 'evolucion', data: ev });
                } else {
                  // no previous DM found — keep as withoutDm
                  withoutDm.push({ kind: 'evolucion', data: ev });
                }
              }
            });

            // assign SOTs similarly: use sots array, which is already sorted descending by hook — invert if needed
            const sotsToAssign = sortNewestFirst ? sots : [...sots].reverse();
            sotsToAssign.forEach(sot => {
              const sotFechaMs = sot?.creacion?.fecha ? Date.parse(String(sot.creacion.fecha)) : 0;
              let chosenKey: string | number | null = null;
              let chosenDiff = Number.POSITIVE_INFINITY;
              for (const entry of dmListForSearch) {
                if (entry.fechaMs <= sotFechaMs) {
                  const diff = sotFechaMs - entry.fechaMs;
                  if (diff < chosenDiff) {
                    chosenDiff = diff;
                    chosenKey = entry.key;
                  }
                }
              }
              if (chosenKey !== null && dmMap.has(chosenKey)) {
                dmMap.get(chosenKey)!.items.push({ kind: 'sot', data: sot });
              } else {
                withoutDm.push({ kind: 'sot', data: sot });
              }
            });

            // sort items inside each DM so SOTs and Evoluciones are mixed by fecha according to direction
            for (const [_, entry] of dmMap.entries()) {
              entry.items.sort((a: any, b: any) => {
                const ta = a.data?.creacion?.fecha ? Date.parse(String(a.data.creacion.fecha)) : 0;
                const tb = b.data?.creacion?.fecha ? Date.parse(String(b.data.creacion.fecha)) : 0;
                return sortNewestFirst ? tb - ta : ta - tb;
              });
            }

            // also sort items without DM
            withoutDm.sort((a, b) => {
              const ta = a.data?.creacion?.fecha ? Date.parse(String(a.data.creacion.fecha)) : 0;
              const tb = b.data?.creacion?.fecha ? Date.parse(String(b.data.creacion.fecha)) : 0;
              return sortNewestFirst ? tb - ta : ta - tb;
            });

            const blocks: React.ReactNode[] = [];

            // render each diagnostico and its items (evoluciones and sots)
            for (const [key, { diagnostico, items }] of dmMap.entries()) {
              const dmData = {
                id_item1: diagnostico.item_1 ? `EJE ${diagnostico.item_1.eje} ${diagnostico.item_1.id_item} ${diagnostico.item_1.descripcion}` : undefined,
                id_item2: diagnostico.item_2 ? `EJE ${diagnostico.item_2.eje} ${diagnostico.item_2.id_item} ${diagnostico.item_2.descripcion}` : undefined,
                id_item3: diagnostico.item_3 ? `EJE ${diagnostico.item_3.eje} ${diagnostico.item_3.id_item} ${diagnostico.item_3.descripcion}` : undefined,
                id_item4: diagnostico.item_4 ? `EJE ${diagnostico.item_4.eje} ${diagnostico.item_4.id_item} ${diagnostico.item_4.descripcion}` : undefined,
                id_item5: diagnostico.item_5 ? `EJE ${diagnostico.item_5.eje} ${diagnostico.item_5.id_item} ${diagnostico.item_5.descripcion}` : undefined,
                id_diagnostico_multiaxial: diagnostico.id_diagnostico_multiaxial,
                creado_por: diagnostico.creacion?.id_usuario,
                fecha_creacion: diagnostico.creacion?.fecha ? new Date(diagnostico.creacion.fecha).toISOString() : undefined,
              } as any;

              blocks.push(
                <div key={`dm-${String(key)}`}>
                  <MultiaxialCard data={dmData} creatorName={diagnostico.creacion?.nombre} />

                  {items.map((it: any) => {
                    if (it.kind === 'evolucion') {
                      const ev = it.data;
                      const evData: any = {
                        id_usuario: Number(ev.id_usuario),
                        id_evolucion: Number(ev.id_evolucion),
                        fecha_creacion: ev.creacion?.fecha ? new Date(ev.creacion.fecha).toISOString() : undefined,
                        observacion: ev.observacion,
                        tipo: ev.tipo,
                      };
                      const isErr = !!ev.erronea;
                      if (isErr) {
                        evData.marcada_erronea = true;
                        evData.motivo_erronea = ev.erronea?.motivo;
                        evData.marcada_erronea_por = ev.erronea?.id_usuario ? Number(ev.erronea.id_usuario) : undefined;
                        evData.fecha_marcada_erronea = ev.erronea?.fecha ? new Date(ev.erronea.fecha).toISOString() : undefined;
                      }
                      return (
                        <div key={`ev-${String(ev.id_evolucion)}`}>
                          <EvolucionCard data={evData} creatorName={ev.creacion?.nombre} evoluciones={evoluciones} setEvoluciones={setEvoluciones} />
                          {isErr && (
                            <CorreccionCard
                              data={{
                                marcada_erronea: true,
                                motivo_erronea: ev.erronea?.motivo,
                                marcada_erronea_por: ev.erronea?.id_usuario ? Number(ev.erronea.id_usuario) : undefined,
                                fecha_marcada_erronea: ev.erronea?.fecha ? new Date(ev.erronea.fecha).toISOString() : undefined,
                                fecha_creacion: ev.creacion?.fecha ? new Date(ev.creacion.fecha).toISOString() : undefined,
                                creada_por: ev.creacion?.id_usuario ? Number(ev.creacion.id_usuario) : undefined,
                              }}
                              markerName={ev.erronea?.nombre}
                              creatorName={ev.creacion?.nombre}
                            />
                          )}
                        </div>
                      );
                    }

                    // kind === 'sot'
                    const sot = it.data;
                    return (
                      <div key={`sot-${String(sot.id_sot)}`}>
                        <SOTCard data={sot} professionalName={undefined} creatorName={sot.creacion?.nombre} />
                      </div>
                    );
                  })}
                </div>
              );
            }

            // render items without diagnostico afterwards
            withoutDm.forEach(it => {
              if (it.kind === 'evolucion') {
                const ev = it.data;
                const evData: any = {
                  id_usuario: Number(ev.id_usuario),
                  id_evolucion: Number(ev.id_evolucion),
                  fecha_creacion: ev.creacion?.fecha ? new Date(ev.creacion.fecha).toISOString() : undefined,
                  observacion: ev.observacion,
                  tipo: ev.tipo
                };
                const isErr = !!ev.erronea;
                if (isErr) {
                  evData.marcada_erronea = true;
                  evData.motivo_erronea = ev.erronea?.motivo;
                  evData.marcada_erronea_por = ev.erronea?.id_usuario ? Number(ev.erronea.id_usuario) : undefined;
                  evData.fecha_marcada_erronea = ev.erronea?.fecha ? new Date(ev.erronea.fecha).toISOString() : undefined;
                }

                blocks.push(
                  <div key={`ev-ndm-${String(ev.id_evolucion)}`}>
                    <EvolucionCard data={evData} creatorName={ev.creacion?.nombre} evoluciones={evoluciones} setEvoluciones={setEvoluciones} />
                    {isErr && (
                      <CorreccionCard
                        data={{
                          marcada_erronea: true,
                          motivo_erronea: ev.erronea?.motivo,
                          marcada_erronea_por: ev.erronea?.id_usuario ? Number(ev.erronea.id_usuario) : undefined,
                          fecha_marcada_erronea: ev.erronea?.fecha ? new Date(ev.erronea.fecha).toISOString() : undefined,
                          fecha_creacion: ev.creacion?.fecha ? new Date(ev.creacion.fecha).toISOString() : undefined,
                          creada_por: ev.creacion?.id_usuario ? Number(ev.creacion.id_usuario) : undefined,
                        }}
                        markerName={ev.erronea?.nombre}
                        creatorName={ev.creacion?.nombre}
                      />
                    )}
                  </div>
                );
              } else {
                const sot = it.data;
                blocks.push(
                  <div key={`sot-ndm-${String(sot.id_sot)}`}>
                    <SOTCard data={sot} professionalName={undefined} creatorName={sot.creacion?.nombre} />
                  </div>
                );
              }
            });

            return blocks;
          })()
        }
      </div>
    </main>
  );
}
