<template>
  <div class="element-wrapper">
    <div
      class="overview-wrapper"
      :class="!contentVisible ? 'overview-wrapper-border' : 'overview-wrapper-background'"
      @click.stop="() => (contentVisible = !contentVisible)"
    >
      <a-image
        width="48px"
        height="48px"
        class="icon-img"
        :preview="false"
        :src="'http://127.0.0.1:8080' + element.icon"
      />
      <div class="primary-info">
        <div class="primary-info-item" style="font-weight: bold">{{ element.alias }}</div>
        <div class="primary-info-item">
          <a>{{ element.name }}</a>
        </div>
        <a-tag :color="element.ordered ? 'success' : 'warning'" :bordered="false">
          {{ element.ordered ? element.ordered : 'None' }}
        </a-tag>
      </div>
    </div>
    <div class="detail-wrapper" v-if="contentVisible">
      {{ element.description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineProps({
  element: null
})

const contentVisible = ref(false)
</script>

<style scoped>
.element-wrapper {
  display: flex;
  flex-direction: column;
}

.overview-wrapper {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
}

.overview-wrapper-background {
  background-color: #f9f9f9;
}

.overview-wrapper-border {
  border-bottom: 1px solid #f0f0f0;
}

.primary-info {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
}

.primary-info-item {
  cursor: pointer;
  flex: 1;
  margin: 2px 0 2px 6px;
}

.primary-info-item:hover {
  color: #5297ff;
}

.detail-wrapper {
  flex: 1;
  background-color: #f9f9f9;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}
</style>
