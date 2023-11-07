<template>
  <div class="workbench-wrapper">
    <div class="selection-wrapper">
      <div class="selection-area">
        <accordion-sidebar style="height: 100%" :list="selectionCategory">
          <template #item_0>
            <element-selection style="width: 100%" element-type="PREDICATE" />
          </template>
          <template #item_1>
            <element-selection style="width: 100%" element-type="FILTER" />
          </template>
          <template #item_2> 3 </template>
        </accordion-sidebar>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AccordionSidebar from './AccordionSidebar.vue'
import ElementSelection from './ElementSelection.vue'

defineProps({
  templateId: String
})

const selectionCategory = ref([
  {
    title: '断言器',
    key: 'PREDICATE'
  },
  {
    title: '过滤器',
    key: 'FILTER'
  },
  {
    title: '元数据',
    key: 'METADATA'
  }
])
</script>

<style scoped>
:deep(.content-layout) {
  padding: 0;
}

.workbench-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.selection-wrapper {
  width: 256px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.selection-area {
  flex: 1;
  overflow-y: auto;
}
</style>
