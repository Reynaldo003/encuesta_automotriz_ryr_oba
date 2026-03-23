import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  Search,
  UserRound,
} from "lucide-react";
import { asesores, motivos, opcionesCalificacion, pasos } from "./data/surveyData";

const STORAGE_KEY = "encuesta-rr-minimal-v2";

const respuestasIniciales = {
  nombre: "",
  asesor: "",
  motivo: "",
  amabilidad: 0,
  seguimiento: 0,
  entrega: 0,
  satisfaccion: 0,
  comentario: "",
};

function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}

function normalizarTexto(valor = "") {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerIniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function validarPaso(paso, respuestas) {
  const valor = respuestas[paso.id];

  switch (paso.tipo) {
    case "texto":
      return String(valor).trim().length >= 2;
    case "asesor":
    case "motivo":
      return Boolean(valor);
    case "calificacion":
      return Number(valor) > 0;
    case "comentario":
      return true;
    default:
      return false;
  }
}

function obtenerOpcionCalificacion(value) {
  return opcionesCalificacion.find((item) => item.value === value) || null;
}

function Encabezado() {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-slate-600 shadow-sm">
          Automotriz R&amp;R
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Encuesta de experiencia
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        Queremos conocer su opinión para seguir mejorando la atención y la
        experiencia dentro de la agencia.
      </p>
    </div>
  );
}

function CabeceraPregunta({ paso }) {
  return (
    <div className="mb-6 sm:mb-8">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
        {paso.etiqueta}
      </span>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {paso.titulo}
      </h2>
    </div>
  );
}

function PreguntaTexto({ paso, valor, onChange, onEnter }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        <UserRound className="h-4 w-4" />
        <span className="text-sm font-medium">Identificación</span>
      </div>

      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter();
        }}
        placeholder={paso.placeholder}
        autoComplete="off"
        className="w-full border-0 bg-transparent text-xl font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-2xl"
      />
    </div>
  );
}

function PreguntaAsesor({ valor, onChange }) {
  const [busqueda, setBusqueda] = useState("");

  const asesoresFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    if (!texto) return asesores;

    return asesores.filter((asesor) =>
      normalizarTexto(asesor).includes(texto)
    );
  }, [busqueda]);

  return (
    <div className="space-y-4">
      <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2">
        <div className="grid gap-2 md:grid-cols-3">
          {asesoresFiltrados.length > 0 ? (
            asesoresFiltrados.map((asesor) => {
              const activo = valor === asesor;
              return (
                <button
                  key={asesor}
                  type="button"
                  onClick={() => onChange(asesor)}
                  className={cls(
                    "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                    activo
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.85)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cls(
                        "truncate text-sm font-medium",
                        activo ? "text-white" : "text-slate-800"
                      )}
                    >
                      {asesor}
                    </p>
                  </div>

                  {activo && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              No se encontraron asesores con esa búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreguntaMotivo({ valor, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {motivos.map((motivo) => {
        const activo = valor === motivo;

        return (
          <button
            key={motivo}
            type="button"
            onClick={() => onChange(motivo)}
            className={cls(
              "rounded-2xl border p-4 text-left transition",
              activo
                ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.85)]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cls(
                  "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                  activo ? "bg-white" : "bg-slate-300"
                )}
              />
              <p className="text-sm font-medium leading-6">{motivo}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PreguntaCalificacion({ valor, onChange }) {
  const seleccion = obtenerOpcionCalificacion(valor);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {opcionesCalificacion.map((opcion) => {
          const activo = valor === opcion.value;

          return (
            <button
              key={opcion.value}
              type="button"
              onClick={() => onChange(opcion.value)}
              className={cls(
                "rounded-2xl border px-4 py-4 text-center transition",
                activo
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.85)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="text-2xl">{opcion.emoji}</div>
              <div className="mt-2 text-sm font-semibold">{opcion.titulo}</div>
            </button>
          );
        })}
      </div>

      {seleccion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <p className="text-sm font-medium text-slate-800">
            Seleccionó: {seleccion.titulo}
          </p>
          <p className="mt-1 text-sm text-slate-500">{seleccion.descripcion}</p>
        </motion.div>
      )}
    </div>
  );
}

function PreguntaComentario({ paso, valor, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        <MessageSquareText className="h-4 w-4" />
        <span className="text-sm font-medium">Comentario opcional</span>
      </div>

      <textarea
        rows={6}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={paso.placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white"
      />

      <p className="mt-3 text-sm text-slate-500">
        Puede dejar este campo vacío si así lo prefiere.
      </p>
    </div>
  );
}

function PantallaFinal({ respuestas, onRestart }) {
  const satisfaccion = obtenerOpcionCalificacion(respuestas.satisfaccion);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
        Gracias por su respuesta
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        Su opinión es muy valiosa para ayudarnos a mejorar la experiencia de
        nuestros clientes.
      </p>

      <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Cliente
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {respuestas.nombre || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Asesor
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {respuestas.asesor || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Motivo
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {respuestas.motivo || "No indicado"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Satisfacción
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {satisfaccion?.titulo || "No indicado"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Responder otra encuesta
      </button>
    </motion.div>
  );
}

export default function App() {
  const [respuestas, setRespuestas] = useState(respuestasIniciales);
  const [indiceActual, setIndiceActual] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [finalizada, setFinalizada] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const timeoutAvanceRef = useRef(null);

  const pasoActual = pasos[indiceActual];
  const puedeContinuar =
    pasoActual.tipo === "comentario" ? true : validarPaso(pasoActual, respuestas);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return;

    try {
      const datos = JSON.parse(guardado);

      setRespuestas({ ...respuestasIniciales, ...(datos.respuestas || {}) });
      setIndiceActual(
        typeof datos.indiceActual === "number"
          ? Math.min(datos.indiceActual, pasos.length - 1)
          : 0
      );
      setFinalizada(Boolean(datos.finalizada));
    } catch (error) {
      console.error("No se pudieron restaurar los datos:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        respuestas,
        indiceActual,
        finalizada,
      })
    );
  }, [respuestas, indiceActual, finalizada]);

  useEffect(() => {
    return () => {
      if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);
    };
  }, []);

  function actualizarRespuesta(campo, valor) {
    setRespuestas((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function siguiente() {
    if (!puedeContinuar) return;
    if (indiceActual >= pasos.length - 1) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    setDireccion(1);
    setIndiceActual((prev) => prev + 1);
  }

  function anterior() {
    if (indiceActual <= 0) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    setDireccion(-1);
    setIndiceActual((prev) => prev - 1);
  }

  function manejarSeleccionConAvance(campo, valor) {
    actualizarRespuesta(campo, valor);

    if (enviando) return;
    if (indiceActual >= pasos.length - 1) return;

    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    timeoutAvanceRef.current = setTimeout(() => {
      setDireccion(1);
      setIndiceActual((prev) => {
        if (prev >= pasos.length - 1) return prev;
        return prev + 1;
      });
    }, 180);
  }

  function reiniciarEncuesta() {
    if (timeoutAvanceRef.current) clearTimeout(timeoutAvanceRef.current);

    localStorage.removeItem(STORAGE_KEY);
    setRespuestas(respuestasIniciales);
    setIndiceActual(0);
    setDireccion(1);
    setFinalizada(false);
    setEnviando(false);
  }

  async function finalizarEncuesta() {
    const payload = {
      ...respuestas,
      nombre: respuestas.nombre.trim(),
      comentario: respuestas.comentario.trim(),
    };

    console.log("Payload listo para backend:", payload);

    setEnviando(true);

    setTimeout(() => {
      setEnviando(false);
      setFinalizada(true);
    }, 900);
  }

  function renderPregunta() {
    switch (pasoActual.tipo) {
      case "texto":
        return (
          <PreguntaTexto
            paso={pasoActual}
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => actualizarRespuesta(pasoActual.id, valor)}
            onEnter={siguiente}
          />
        );

      case "asesor":
        return (
          <PreguntaAsesor
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "motivo":
        return (
          <PreguntaMotivo
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "calificacion":
        return (
          <PreguntaCalificacion
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => manejarSeleccionConAvance(pasoActual.id, valor)}
          />
        );

      case "comentario":
        return (
          <PreguntaComentario
            paso={pasoActual}
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => actualizarRespuesta(pasoActual.id, valor)}
          />
        );

      default:
        return null;
    }
  }

  const mostrarBotonContinuarManual =
    pasoActual.tipo === "texto" || pasoActual.tipo === "comentario";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-sm bg-slate-200/60 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-8%] h-72 w-72 rounded-sm bg-blue-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-[18px] border border-white/60 bg-white/85 p-5 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-8 md:p-10"
        >
          {finalizada ? (
            <PantallaFinal respuestas={respuestas} onRestart={reiniciarEncuesta} />
          ) : (
            <>
              <Encabezado />
              <CabeceraPregunta paso={pasoActual} />

              <AnimatePresence mode="wait" custom={direccion}>
                <motion.div
                  key={pasoActual.id}
                  custom={direccion}
                  initial={{ opacity: 0, x: direccion > 0 ? 22 : -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direccion > 0 ? -22 : 22 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderPregunta()}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={anterior}
                  disabled={indiceActual === 0 || enviando}
                  className={cls(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
                    indiceActual === 0 || enviando
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Regresar
                </button>

                {mostrarBotonContinuarManual ? (
                  <button
                    type="button"
                    onClick={
                      indiceActual === pasos.length - 1 ? finalizarEncuesta : siguiente
                    }
                    disabled={enviando || !puedeContinuar}
                    className={cls(
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition",
                      enviando || !puedeContinuar
                        ? "cursor-not-allowed bg-slate-300 text-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    {enviando ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Enviando...
                      </>
                    ) : indiceActual === pasos.length - 1 ? (
                      "Finalizar encuesta"
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Seleccione una opción para continuar automáticamente.
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}