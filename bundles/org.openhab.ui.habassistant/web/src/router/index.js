import { createRouter, createWebHistory } from "vue-router";
import Assistant from "../views/AssistantView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "assistant",
      component: Assistant,
    },
    {
      path: "/settings",
      name: "settings",
      // lazy-loaded when the route is visited.
      component: () => import("../views/SettingsView.vue"),
    },
    {
      path: "/audio-error",
      name: "audio error",
      // lazy-loaded when the route is visited.
      component: () => import("../views/AudioErrorView.vue"),
    },
    {
      path: "/error",
      name: "error",
      // lazy-loaded when the route is visited.
      component: () => import("../views/ErrorView.vue"),
    },
  ],
});

export default router;
