import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MessageSquareText,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { asesores, motivos, opcionesCalificacion, pasos } from "./data/surveyData";

const STORAGE_KEY = "encuesta-rr-clara-v1";

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

function obtenerTituloCalificacion(value) {
  return opcionesCalificacion.find((item) => item.value === value)?.titulo || "";
}

function ResumenSuperior({ indiceActual, total }) {
  const porcentaje = Math.round(((indiceActual + 1) / total) * 100);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="pastilla">
          Paso {indiceActual + 1} de {total}
        </span>
        <span className="text-sm font-semibold text-slate-500">{porcentaje}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#131E5C] to-blue-800"
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </div>
  );
}

function Encabezado() {
  return (
    <div className="mb-6 text-center">
      <div className="mb-4 flex justify-center">
        <span className="pastilla">Automotriz R&R</span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
        Encuesta de experiencia
      </h1>

      <h1 className="text-base font-extrabold tracking-tight text-slate-800 sm:text-xl">
        ¡Gracias por ser parte de nosotros!
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        Queremos conocer su opinión para seguir mejorando su experiencia con nosotros.
      </p>
    </div>
  );
}

function NavegacionPasos({ pasos, indiceActual }) {
  return (
    <div className="mb-6 hidden items-center justify-center gap-2 md:flex">
      {pasos.map((paso, index) => {
        const activo = index === indiceActual;
        const completado = index < indiceActual;

        return (
          <div key={paso.id} className="flex items-center gap-2">
            <div
              className={cls(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition",
                activo && "bg-[#131E5C] text-white shadow-md",
                completado && "bg-emerald-500 text-white",
                !activo && !completado && "border border-slate-200 bg-white text-slate-500"
              )}
            >
              {completado ? <Check className="h-4 w-4" /> : index + 1}
            </div>

            {index < pasos.length - 1 && (
              <div className="h-[2px] w-8 rounded-full bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreguntaTexto({ paso, valor, onChange }) {
  return (
    <div className="space-y-4">
      <div className="tarjeta-suave rounded-3xl p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-slate-500">
          <UserRound className="h-4 w-4" />
          <span className="text-sm font-medium">Identificación</span>
        </div>

        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={paso.placeholder}
          className="input-limpio text-lg font-semibold sm:text-xl"
        />
      </div>
    </div>
  );
}

function PreguntaAsesor({ valor, onChange }) {
  const [busqueda, setBusqueda] = useState("");

  const asesoresFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);
    if (!texto) return asesores;

    return asesores.filter((asesor) => normalizarTexto(asesor).includes(texto));
  }, [busqueda]);

  return (
    <div className="space-y-4">
      <div className="tarjeta-suave rounded-3xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar asesor..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-sky-400"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {asesoresFiltrados.map((asesor) => {
          const activo = valor === asesor;

          return (
            <button
              key={asesor}
              type="button"
              onClick={() => onChange(asesor)}
              className={cls(
                "rounded-3xl border p-4 text-left transition",
                activo
                  ? "border-sky-500 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cls(
                      "mt-0.5 flex h-10 w-10 items-center justify-center rounded-full",
                      activo ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <UsersRound className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">{asesor}</p>
                    <p className="mt-1 text-sm text-slate-500">Asesor de ventas</p>
                  </div>
                </div>

                {activo && <CheckCircle2 className="h-5 w-5 text-sky-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreguntaMotivo({ valor, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {motivos.map((motivo) => {
        const activo = valor === motivo;

        return (
          <button
            key={motivo}
            type="button"
            onClick={() => onChange(motivo)}
            className={cls(
              "rounded-3xl border p-5 text-left transition",
              activo
                ? "border-sky-500 bg-sky-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold leading-7 text-slate-800">{motivo}</p>
              {activo && <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-500" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PreguntaCalificacion({ valor, onChange }) {
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
                "rounded-3xl border p-4 text-center transition",
                activo
                  ? "border-sky-500 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50"
              )}
            >
              <div className="text-3xl">{opcion.emoji}</div>
              <div className="mt-3 font-bold text-slate-800">{opcion.titulo}</div>
              <div className="mt-1 text-sm leading-5 text-slate-500">
                {opcion.descripcion}
              </div>
            </button>
          );
        })}
      </div>

      {valor > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          Selección actual: {obtenerTituloCalificacion(valor)}
        </motion.div>
      )}
    </div>
  );
}

function PreguntaComentario({ paso, valor, onChange }) {
  return (
    <div className="space-y-4">
      <div className="tarjeta-suave rounded-3xl p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-slate-500">
          <MessageSquareText className="h-4 w-4" />
          <span className="text-sm font-medium">Comentario</span>
        </div>

        <textarea
          rows={6}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={paso.placeholder}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-sky-400"
        />

        <p className="mt-3 text-sm text-slate-500">Este campo es opcional.</p>
      </div>
    </div>
  );
}

function PantallaFinal({ respuestas, onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 text-center"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h2 className="mt-6 text-3xl font-extrabold text-slate-800">
        ¡Gracias por su respuesta!
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Su opinión nos ayuda a mejorar la experiencia de nuestros clientes.
      </p>

      <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
        <div className="tarjeta-suave rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Cliente
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {respuestas.nombre || "No indicado"}
          </p>
        </div>

        <div className="tarjeta-suave rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Asesor
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {respuestas.asesor || "No indicado"}
          </p>
        </div>

        <div className="tarjeta-suave rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Motivo
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {respuestas.motivo || "No indicado"}
          </p>
        </div>

        <div className="tarjeta-suave rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Satisfacción
          </p>
          <p className="mt-1 font-semibold text-slate-800">
            {obtenerTituloCalificacion(respuestas.satisfaccion) || "No indicado"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="boton-secundario mt-8 rounded-2xl px-6 py-3 font-semibold transition"
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
      if (timeoutAvanceRef.current) {
        clearTimeout(timeoutAvanceRef.current);
      }
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

    if (timeoutAvanceRef.current) {
      clearTimeout(timeoutAvanceRef.current);
    }

    setDireccion(1);
    setIndiceActual((prev) => prev + 1);
  }

  function anterior() {
    if (indiceActual <= 0) return;

    if (timeoutAvanceRef.current) {
      clearTimeout(timeoutAvanceRef.current);
    }

    setDireccion(-1);
    setIndiceActual((prev) => prev - 1);
  }

  function manejarSeleccionConAvance(campo, valor) {
    actualizarRespuesta(campo, valor);

    if (enviando) return;
    if (indiceActual >= pasos.length - 1) return;

    if (timeoutAvanceRef.current) {
      clearTimeout(timeoutAvanceRef.current);
    }

    timeoutAvanceRef.current = setTimeout(() => {
      setDireccion(1);
      setIndiceActual((prev) => {
        if (prev >= pasos.length - 1) return prev;
        return prev + 1;
      });
    }, 180);
  }

  function reiniciarEncuesta() {
    if (timeoutAvanceRef.current) {
      clearTimeout(timeoutAvanceRef.current);
    }

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
    }, 1100);
  }

  function renderPregunta() {
    switch (pasoActual.tipo) {
      case "texto":
        return (
          <PreguntaTexto
            paso={pasoActual}
            valor={respuestas[pasoActual.id]}
            onChange={(valor) => actualizarRespuesta(pasoActual.id, valor)}
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
    <div className="relative min-h-screen">
      <div className="fondo-suave" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="tarjeta-principal w-full rounded-[32px] p-5 sm:p-8 md:p-10"
        >
          {finalizada ? (
            <PantallaFinal respuestas={respuestas} onRestart={reiniciarEncuesta} />
          ) : (
            <>
              <Encabezado />
              <NavegacionPasos pasos={pasos} indiceActual={indiceActual} />
              <ResumenSuperior indiceActual={indiceActual} total={pasos.length} />

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
                  {pasoActual.titulo}
                </h2>
              </div>

              <AnimatePresence mode="wait" custom={direccion}>
                <motion.div
                  key={pasoActual.id}
                  custom={direccion}
                  initial={{ opacity: 0, x: direccion > 0 ? 25 : -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direccion > 0 ? -25 : 25 }}
                  transition={{ duration: 0.22 }}
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
                    "rounded-2xl px-5 py-3 font-semibold transition",
                    indiceActual === 0 || enviando
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "boton-secundario"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Regresar
                  </span>
                </button>

                {mostrarBotonContinuarManual ? (
                  <button
                    type="button"
                    onClick={
                      indiceActual === pasos.length - 1 ? finalizarEncuesta : siguiente
                    }
                    disabled={enviando || !puedeContinuar}
                    className={cls(
                      "rounded-2xl px-6 py-3 font-semibold transition",
                      enviando || !puedeContinuar
                        ? "cursor-not-allowed bg-slate-300 text-white"
                        : "boton-primario"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {enviando ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                          Enviando...
                        </>
                      ) : indiceActual === pasos.length - 1 ? (
                        <>Finalizar encuesta</>
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                    Seleccione una opción para continuar automáticamente
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