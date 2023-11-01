<template>
  <property-component :element-id="elementId" />
</template>

<script lang="ts" setup>
import PropertyComponent from '../components/PropertyComponent.vue'

const props = defineProps({
  elementId: String
})
</script>
