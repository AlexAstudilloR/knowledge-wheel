<template>
  <div v-if="hasValidData" class="p-6 shadow-md rounded-2xl bg-white">
    <h2 class="text-lg font-semibold mb-4 text-center">{{ student.Nombre }}</h2>

    <!-- Radar Chart -->
    <div class="w-full h-96 mb-6">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Observaciones por cada habilidad -->
    <div class="space-y-4">
      <div v-for="(label, index) in labels" :key="index">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
        <textarea
          v-model="student.observations[label]"
          :placeholder="`Escribe una observación para ${label}...`"
          class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
          rows="2"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController)

const props = defineProps({
  student: Object
})

const chartCanvas = ref(null)
let chartInstance = null

const labels = [
  'Conocimientos',
  'Habilidades',
  'Actitudes',
  'Trabajo en equipo',
  'Dominio de las TIC'
]

const hasValidData = computed(() => {
  const values = labels.map(label => props.student[label])
  return values.some(val => typeof val === 'number' && val > 0)
})

// Función para obtener color según puntaje
const getColorByScore = (score) => {
  if (score >= 10) return { bg: 'rgba(34, 197, 94, 0.3)', border: 'rgba(34, 197, 94, 1)' } // Verde
  if (score >= 9) return { bg: 'rgba(234, 179, 8, 0.3)', border: 'rgba(234, 179, 8, 1)' } // Amarillo
  if (score >= 8) return { bg: 'rgba(249, 115, 22, 0.3)', border: 'rgba(249, 115, 22, 1)' } // Naranja
  if (score >= 7) return { bg: 'rgba(239, 68, 68, 0.3)', border: 'rgba(239, 68, 68, 1)' } // Rojo
  return { bg: 'rgba(156, 163, 175, 0.3)', border: 'rgba(156, 163, 175, 1)' } // Gris para < 7
}

onMounted(() => {
  if (chartCanvas.value && hasValidData.value) {
    const conocimientosColor = getColorByScore(props.student.Conocimientos || 0)
    const habilidadesColor = getColorByScore(props.student.Habilidades || 0)
    const actitudesColor = getColorByScore(props.student.Actitudes || 0)
    const trabajoEquipoColor = getColorByScore(props.student['Trabajo en equipo'] || 0)
    const ticColor = getColorByScore(props.student['Dominio de las TIC'] || 0)

    chartInstance = new ChartJS(chartCanvas.value, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Conocimientos',
            data: [
              props.student.Conocimientos || 0,
              (props.student.Conocimientos || 0) * 0.2,
              0,
              0,
              (props.student.Conocimientos || 0) * 0.2
            ],
            backgroundColor: conocimientosColor.bg,
            borderColor: conocimientosColor.border,
            fill: true,
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: 'Habilidades',
            data: [
              (props.student.Habilidades || 0) * 0.2,
              props.student.Habilidades || 0,
              (props.student.Habilidades || 0) * 0.2,
              0,
              0
            ],
            backgroundColor: habilidadesColor.bg,
            borderColor: habilidadesColor.border,
            fill: true,
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: 'Actitudes',
            data: [
              0,
              (props.student.Actitudes || 0) * 0.2,
              props.student.Actitudes || 0,
              (props.student.Actitudes || 0) * 0.2,
              0
            ],
            backgroundColor: actitudesColor.bg,
            borderColor: actitudesColor.border,
            fill: true,
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: 'Trabajo en equipo',
            data: [
              0,
              0,
              (props.student['Trabajo en equipo'] || 0) * 0.2,
              props.student['Trabajo en equipo'] || 0,
              (props.student['Trabajo en equipo'] || 0) * 0.2
            ],
            backgroundColor: trabajoEquipoColor.bg,
            borderColor: trabajoEquipoColor.border,
            fill: true,
            borderWidth: 1,
            pointRadius: 0
          },
          {
            label: 'Dominio de las TIC',
            data: [
              (props.student['Dominio de las TIC'] || 0) * 0.2,
              0,
              0,
              (props.student['Dominio de las TIC'] || 0) * 0.2,
              props.student['Dominio de las TIC'] || 0
            ],
            backgroundColor: ticColor.bg,
            borderColor: ticColor.border,
            fill: true,
            borderWidth: 1,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 5,
            ticks: {
              stepSize: 1,
              color: '#666',
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)',
              circular: true
            },
            angleLines: { color: 'rgba(0,0,0,0.2)' },
            pointLabels: { font: { size: 14 } }
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ${context.raw.toFixed(1)}`
            }
          }
        },
        elements: {
          line: { tension: 0 }
        }
      }
    })
  }
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
textarea::placeholder {
  color: #aaa;
}
</style>