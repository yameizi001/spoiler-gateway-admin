import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/service/systemctl'
    },
    {
      path: '/service/systemctl',
      name: 'systemctl-service',
      component: () => import('../views/SystemctlServiceView.vue')
    },
    {
      path: '/instance/systemctl/:serviceId',
      name: 'systemctl-instance',
      props: true,
      component: () => import('../views/SystemctlInstanceView.vue')
    },
    {
      path: '/plugin/element/predicate',
      name: 'plugin-predicate',
      component: () => import('../views/PredicateView.vue')
    },
    {
      path: '/plugin/element/filter',
      name: 'plugin-filter',
      component: () => import('../views/FilterView.vue')
    },
    {
      path: '/plugin/element/property/:elementId',
      name: 'plugin-property',
      props: true,
      component: () => import('../views/PropertyView.vue')
    },
    {
      path: '/plugin/metadata',
      name: 'plugin-metadata',
      component: () => import('../views/MetadataView.vue')
    },
    {
      path: '/template',
      name: 'template',
      component: () => import('../views/TemplateView.vue')
    },
    {
      path: '/template/workbench/:templateId?',
      name: 'template-workbench',
      props: true,
      component: () => import('../components/TemplateWorkbench.vue')
    },
    {
      path: '/route',
      name: 'route',
      component: () => import('../views/RouteView.vue')
    },
    {
      path: '/route/workbench',
      name: 'route-workbench',
      props: (route) => ({
        routeId: route.query.routeId,
        templateId: route.query.templateId
      }),
      component: () => import('../components/RouteWorkbench.vue')
    }
  ]
})

export default router
