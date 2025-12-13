import { useEffect, useRef } from "react";
import { App } from "dwv"; // <--- CORRECCIÓN AQUÍ: Usamos { App } en lugar de dwv por defecto

export default function DicomViewerModal({ study, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Verificamos que el contenedor exista
    if (!containerRef.current) return;

    // Inicializamos la APP de DWV
    const app = new App();

    app.init({
      dataViewers: ["WebMerge"], // Visor 2D básico
      containerDivId: "dicom-container",
      tools: ["Scroll", "ZoomAndPan", "WindowLevel"], // Herramientas básicas
    });

    // Esperamos a que la app cargue para pasarle la URL
    app.addEventListener("load", () => {
      // La librería está lista
      console.log("DWV Cargado");
    });

    // Cargamos el archivo desde Wasabi
    if (study && study.file_url) {
      app.loadURLs([study.file_url]);
    }

    // Limpieza al cerrar el componente (para evitar fugas de memoria)
    return () => {
      // Si dwv tuviera método destroy lo usaríamos aquí
      // Por ahora limpiamos el contenido HTML si es necesario
    };
  }, [study]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[80vh] flex flex-col rounded overflow-hidden relative">
        {/* Encabezado del Modal */}
        <div className="flex justify-between p-3 bg-gray-200 border-b">
          <h3 className="font-bold text-gray-800">Visor: {study.study_name}</h3>
          <button
            onClick={onClose}
            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold"
          >
            Cerrar X
          </button>
        </div>

        {/* Contenedor del Visor - IMPORTANTE: ID debe coincidir con containerDivId */}
        <div
          id="dicom-container"
          ref={containerRef}
          className="flex-1 w-full h-full relative bg-black overflow-hidden"
        >
          {/* DWV inyectará el canvas aquí automáticamente */}
          <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
            <span className="opacity-50">Cargando imagen...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
