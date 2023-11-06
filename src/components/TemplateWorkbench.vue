<template>
  <div class="workbench-wrapper">
    <div class="workbench-item-wrapper">
      <div class="operation-wrapper">
        <div>断言器操作区</div>
        <div class="operation-area"></div>
      </div>
      <a-divider style="height: 100%" type="vertical" />
      <div class="selection-wrapper">
        <div>断言器选择区</div>
        <div class="selection-area">
          <selection-element element-type="PREDICATE" />
        </div>
      </div>
    </div>
    <a-divider style="width: 100%; margin: 12px 0" />
    <div class="workbench-item-wrapper">
      <div class="operation-wrapper">
        <div>过滤器操作区</div>
        <div class="operation-area"></div>
      </div>
      <a-divider style="height: 100%" type="vertical" />
      <div class="selection-wrapper">
        <div>过滤器选择区</div>
        <div class="selection-area">
          <selection-element element-type="FILTER" />
        </div>
      </div>
    </div>
    <a-divider style="width: 100%; margin: 12px 0" />
    <div class="workbench-item-wrapper">
      <div class="operation-wrapper">
        <div>元数据操作区</div>
        <div class="operation-area"></div>
      </div>
      <a-divider style="height: 100%" type="vertical" />
      <div class="selection-wrapper">元数据选择区</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SelectionElement from './SelectionElement.vue'

defineProps({
  templateId: String
})
</script>

<style scoped>
.workbench-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.workbench-item-wrapper {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.operation-wrapper {
  flex: 1 0 0%;
  display: flex;
  flex-direction: column;
}

.operation-area {
  flex: 1;
  width: 100%;
  background-color: #f5f5f5;
  margin-top: 8px;
}

.selection-wrapper {
  flex: 1 0 0%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.selection-area {
  flex: 1;
  width: 100%;
  margin-top: 8px;
}
</style>
