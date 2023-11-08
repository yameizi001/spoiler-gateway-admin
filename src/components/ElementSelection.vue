<template>
  <div class="selection-wrapper">
    <!-- query -->
    <div class="query-wrapper">
      <a-input-search
        allowClear
        style="width: 160px; flex: 1"
        size="small"
        v-model:value="queryForm.alias"
        placeholder="输入组件别名"
        @search="get"
      />
      <a-button
        style="margin-left: 8px"
        title="上一页"
        size="small"
        type="link"
        :icon="h(UpOutlined)"
        @click="onClickPrev"
      ></a-button>
      <a-button
        style="margin-left: 8px"
        title="下一页"
        size="small"
        type="link"
        :icon="h(DownOutlined)"
        @click="onClickNext"
      ></a-button>
    </div>
    <!-- list -->
    <div class="list-wrapper">
      <draggable
        style="height: 100%"
        animation="500"
        :sort="false"
        :list="data"
        :group="{ name: elementType, pull: 'clone', put: false }"
        item-key="id"
      >
        <template #item="{ element }">
          <selection-element-item :element="element" />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, h } from 'vue'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'
import ElementApi from '../api/element/element'
import SelectionElementItem from './SelectionElementItem.vue'

const props = defineProps({
  elementType: {
    type: String,
    required: true
  }
})

onMounted(async () => {
  await get()
})

const queryForm = ref<{
  alias?: string | null
  type?: string | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  alias: null,
  type: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const data = ref([])

async function get() {
  queryForm.value.type = props.elementType
  const resp = await ElementApi.getPageableElementList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

const onClickPrev = async function () {
  if (queryForm.value.page.num === 1) {
    message.error('已经是第一页了!')
    return
  }
  queryForm.value.page.num = queryForm.value.page.num - 1
  await get()
}

const onClickNext = async function () {
  if (queryForm.value.page.num * queryForm.value.page.size >= queryForm.value.page.total) {
    message.error('已经是最后一页了!')
    return
  }
  queryForm.value.page.num = queryForm.value.page.num + 1
  await get()
}
</script>

<style scoped>
.selection-wrapper {
  display: flex;
  flex-direction: column;
}

.query-wrapper {
  height: 24px;
  line-height: 24px;
  display: flex;
  flex-direction: row;
}

.list-wrapper {
  flex: 1;
  margin-top: 12px;
  overflow-y: auto;
}
</style>
