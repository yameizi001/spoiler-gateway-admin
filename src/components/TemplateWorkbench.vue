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
          <template #item_2>
            <element-selection style="width: 100%" element-type="FILTER" />
          </template>
        </accordion-sidebar>
      </div>
    </div>
    <div class="operation-wrapper" @click="() => (formVisible = !formVisible)">
      <div class="affix-wrapper">
        <a-affix :offset-top="0">
          <a-anchor
            :items="[
              {
                key: 'part-1',
                href: '#part-1',
                title: '断言器'
              },
              {
                key: 'part-2',
                href: '#part-2',
                title: '过滤器'
              },
              {
                key: 'part-3',
                href: '#part-3',
                title: '元数据'
              }
            ]"
          />
        </a-affix>
      </div>
      <div
        class="form-wrapper-mask"
        v-show="formVisible"
        @click="() => (formVisible = false)"
      ></div>
    </div>
    <transition name="form-wrapper">
      <div class="form-wrapper" v-show="formVisible"></div>
    </transition>
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

const predicates = ref([])

const formVisible = ref(false)
</script>

<style scoped>
:deep(.content-layout) {
  padding: 0;
}

.workbench-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.selection-wrapper {
  width: 256px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.selection-area {
  flex: 1;
  overflow-y: auto;
}

.operation-wrapper {
  flex: 1;
  background-color: #f5f5f5;
}

.affix-wrapper {
  float: right;
  padding: 8px 32px 0 0;
}

.form-wrapper-mask {
  position: fixed;
  left: 0;
  right: 400px;
  top: 0;
  bottom: 0;
}

.form-wrapper {
  width: 384px;
  height: 100%;
  transition: width 0.2s ease;
}

.form-wrapper-enter-active,
.form-wrapper-leave-from {
  width: 1;
}

.form-wrapper-leave-active,
.form-wrapper-enter-from {
  width: 0;
}
</style>
