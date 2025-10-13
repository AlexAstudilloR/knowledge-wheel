// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../modules/knowledge/pages/Home.vue'


const routes = [
  { path: '/', name: 'home', component: Home },

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
