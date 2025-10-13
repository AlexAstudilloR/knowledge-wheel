<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
    <h1 class="text-3xl font-bold text-blue-900 mb-8">
      Evaluación de Estudiantes
    </h1>

    <!-- Subida del archivo -->
    <div class="bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl mx-auto">
      <h2
        class="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2"
      >
        <font-awesome-icon
          :icon="['fas', 'file-excel']"
          class="text-green-500 text-2xl"
        />
        Subir archivo Excel
      </h2>

      <label
        for="excelUpload"
        class="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-gray-600"
      >
        <font-awesome-icon
          :icon="['fas', 'file-excel']"
          class="text-green-500 text-4xl mb-4"
        />
        <span class="text-gray-700 font-medium"
          >Haz clic o arrastra tu archivo aquí</span
        >
        <input
          id="excelUpload"
          type="file"
          accept=".xlsx, .xls"
          @change="handleFileUpload"
          class="hidden"
        />
      </label>
    </div>

    <!-- Botón de descarga -->
    <div v-if="students.length" class="mt-8">
      <button
        @click="downloadPDF"
        :disabled="isGeneratingPDF"
        class="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <font-awesome-icon
          :icon="
            isGeneratingPDF ? ['fas', 'hourglass-start'] : ['fas', 'download']
          "
          class="text-white"
        />
        {{ isGeneratingPDF ? "Generando PDF..." : " Descargar PDF" }}
      </button>
    </div>

    <!-- Radar de cada estudiante con observación -->
    <div
      v-if="students.length"
      class="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10 w-full max-w-6xl"
    >
      <div
        v-for="(student, index) in students"
        :key="`student-${index}-${student.Nombre}`"
        class="print-zone"
      >
        <RadarChartStudent :student="student" />
      </div>
    </div>

    <p v-else class="text-gray-500 mt-10">
      Sube un archivo Excel para generar las dianas de evaluación.
    </p>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref } from "vue";
import { jsPDF } from "jspdf";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController,
} from "chart.js";
import RadarChartStudent from "../components/RadarChartStudent.vue";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
);

const students = ref([]);
const isGeneratingPDF = ref(false);

/**
 * Carga los datos desde el Excel
 */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  students.value = [];

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const filteredStudents = jsonData
      .filter((student) => {
        if (!student.Nombre || student.Nombre.trim() === "") return false;
        const values = [
          student.Conocimientos,
          student.Habilidades,
          student.Actitudes,
          student["Trabajo en equipo"],
          student["Dominio de las TIC"],
        ];
        return values.some((val) => typeof val === "number" && val > 0);
      })
      .slice(0, 10);

    // Inicializar observaciones por cada habilidad
    filteredStudents.forEach((s) => {
      s.observations = {
        Conocimientos: "",
        Habilidades: "",
        Actitudes: "",
        "Trabajo en equipo": "",
        "Dominio de las TIC": "",
      };
    });

    students.value = filteredStudents;
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Función para obtener color según puntaje (V2)
 */
const getColorByScore = (score) => {
  if (score >= 10) return { bg: 'rgba(34, 197, 94, 0.3)', border: 'rgba(34, 197, 94, 1)' } // Verde
  if (score >= 9) return { bg: 'rgba(234, 179, 8, 0.3)', border: 'rgba(234, 179, 8, 1)' } // Amarillo
  if (score >= 8) return { bg: 'rgba(249, 115, 22, 0.3)', border: 'rgba(249, 115, 22, 1)' } // Naranja
  if (score >= 7) return { bg: 'rgba(239, 68, 68, 0.3)', border: 'rgba(239, 68, 68, 1)' } // Rojo
  return { bg: 'rgba(156, 163, 175, 0.3)', border: 'rgba(156, 163, 175, 1)' } // Gris para < 7
}

/**
 * Genera un gráfico radar IDÉNTICO al componente RadarChartStudent.vue V2
 * Con colores dinámicos según puntaje
 */
async function generateRadarImage(student) {
  const labels = [
    "Conocimientos",
    "Habilidades",
    "Actitudes",
    "Trabajo en equipo",
    "Dominio de las TIC",
  ];

  // Obtener colores dinámicos para cada aptitud
  const conocimientosColor = getColorByScore(student.Conocimientos || 0);
  const habilidadesColor = getColorByScore(student.Habilidades || 0);
  const actitudesColor = getColorByScore(student.Actitudes || 0);
  const trabajoEquipoColor = getColorByScore(student["Trabajo en equipo"] || 0);
  const ticColor = getColorByScore(student["Dominio de las TIC"] || 0);

  // Tamaño reducido del canvas para optimizar peso
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;

  const chart = new ChartJS(canvas, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Conocimientos",
          data: [
            student.Conocimientos || 0,
            (student.Conocimientos || 0) * 0.2,
            0,
            0,
            (student.Conocimientos || 0) * 0.2,
          ],
          backgroundColor: conocimientosColor.bg,
          borderColor: conocimientosColor.border,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "Habilidades",
          data: [
            (student.Habilidades || 0) * 0.2,
            student.Habilidades || 0,
            (student.Habilidades || 0) * 0.2,
            0,
            0,
          ],
          backgroundColor: habilidadesColor.bg,
          borderColor: habilidadesColor.border,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "Actitudes",
          data: [
            0,
            (student.Actitudes || 0) * 0.2,
            student.Actitudes || 0,
            (student.Actitudes || 0) * 0.2,
            0,
          ],
          backgroundColor: actitudesColor.bg,
          borderColor: actitudesColor.border,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "Trabajo en equipo",
          data: [
            0,
            0,
            (student["Trabajo en equipo"] || 0) * 0.2,
            student["Trabajo en equipo"] || 0,
            (student["Trabajo en equipo"] || 0) * 0.2,
          ],
          backgroundColor: trabajoEquipoColor.bg,
          borderColor: trabajoEquipoColor.border,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
        {
          label: "Dominio de las TIC",
          data: [
            (student["Dominio de las TIC"] || 0) * 0.2,
            0,
            0,
            (student["Dominio de las TIC"] || 0) * 0.2,
            student["Dominio de las TIC"] || 0,
          ],
          backgroundColor: ticColor.bg,
          borderColor: ticColor.border,
          fill: true,
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      devicePixelRatio: 1,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 5,
          ticks: {
            stepSize: 1,
            color: "#666",
            backdropColor: "transparent",
            font: { size: 12 },
          },
          grid: {
            color: "rgba(0,0,0,0.1)",
            circular: true,
          },
          angleLines: { color: "rgba(0,0,0,0.2)" },
          pointLabels: {
            font: { size: 13 },
            color: "#333",
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 11 },
            padding: 10,
          },
        },
        tooltip: { enabled: false },
      },
      elements: {
        line: { tension: 0 },
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  const imageData = canvas.toDataURL("image/png");
  chart.destroy();
  return imageData;
}

/**
 * Genera el PDF completo con gráficos V2 (colores dinámicos)
 */
const downloadPDF = async () => {
  if (isGeneratingPDF.value) return;
  isGeneratingPDF.value = true;

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < students.value.length; i++) {
      const s = students.value[i];

      if (i > 0) pdf.addPage();

      // Título: Nombre del estudiante
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(30, 58, 138);
      pdf.text(s.Nombre || "Estudiante sin nombre", pageWidth / 2, 35, {
        align: "center",
      });

      // Generar gráfico radar V2 con colores dinámicos
      const chartImg = await generateRadarImage(s);
      const chartSize = 280;
      const chartX = (pageWidth - chartSize) / 2;
      pdf.addImage(
        chartImg,
        "PNG",
        chartX,
        55,
        chartSize,
        chartSize,
        undefined,
        "FAST"
      );

      // Sección de observaciones
      let yPos = 355;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Observaciones por Habilidad:", 40, yPos);

      yPos += 18;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      const labels = [
        "Conocimientos",
        "Habilidades",
        "Actitudes",
        "Trabajo en equipo",
        "Dominio de las TIC",
      ];

      for (const label of labels) {
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, 40, yPos);
        pdf.setFont("helvetica", "normal");

        const observation = s.observations[label] || "Sin observaciones";
        const lines = pdf.splitTextToSize(observation, pageWidth - 80);

        yPos += 13;
        pdf.text(lines, 40, yPos);
        yPos += lines.length * 11 + 6;

        if (yPos > pageHeight - 50 && label !== labels[labels.length - 1]) {
          pdf.addPage();
          yPos = 40;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text(`${s.Nombre} (continuación)`, pageWidth / 2, 25, {
            align: "center",
          });
          yPos += 15;
        }
      }
    }

    pdf.save("evaluacion_estudiantes.pdf");
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Error al generar el PDF. Intenta nuevamente.");
  } finally {
    isGeneratingPDF.value = false;
  }
};
</script>

<style scoped>
.print-zone {
  background-color: rgb(255, 255, 255) !important;
}
</style>