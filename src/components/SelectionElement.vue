<template>
  <div class="selection-wrapper">
    <!-- query -->
    <div class="query-wrapper">
      <!-- form -->
      <div style="flex: 1">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="编码：">
            <a-input
              allowClear
              v-model:value="queryForm.name"
              size="small"
              placeholder="请输入组件编码"
            />
          </a-form-item>
          <a-form-item label="别名：">
            <a-input
              allowClear
              v-model:value="queryForm.alias"
              size="small"
              placeholder="请输入组件别名"
            />
          </a-form-item>
        </a-form>
      </div>
      <!-- search and page -->
      <a-button type="link" :icon="h(SearchOutlined)" @click="onClickQuery" />
      <a-button title="上一页" type="link" :icon="h(UpOutlined)" @click="onClickPrev" />
      <a-button title="下一页" type="link" :icon="h(DownOutlined)" @click="onClickNext" />
    </div>
    <!-- content -->
    <div class="content-wrapper">
      <div v-for="item in data" :key="item.id">
        <element-item :element="item" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SearchOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, h } from 'vue'
import ElementItem from './ElementItem.vue'
import ElementApi from '../api/element/element'
import { message } from 'ant-design-vue'

const props = defineProps({
  elementType: String
})

onMounted(async () => {
  await get()
})

const queryForm = ref<{
  name?: string | null
  alias?: string | null
  ordered?: boolean | null
  type?: string | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  name: null,
  alias: null,
  ordered: null,
  type: null,
  page: {
    num: 1,
    size: 4,
    total: 0
  }
})

const data = ref([])

async function get() {
  queryForm.value.type = props.elementType ? props.elementType : ''
  const resp = await ElementApi.getPageableElementList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

const onClickQuery = async function () {
  await get()
}

const onClickPrev = async function () {
  if (queryForm.value.page.num === 1) {
    message.error('已经是第一页了')
    return
  }
  queryForm.value.page.num = queryForm.value.page.num - 1
  await get()
}

const onClickNext = async function () {
  if (queryForm.value.page.num * queryForm.value.page.size >= queryForm.value.page.total) {
    message.error('已经是最后一页了')
    return
  }
  queryForm.value.page.num = queryForm.value.page.num + 1
  await get()
}
</script>

<style scoped>
:deep(.ant-form-inline) {
  flex-wrap: nowrap !important;
}

.selection-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.query-wrapper {
  height: 32px;
  line-height: 32px;
  display: flex;
  width: 100%;
  min-width: max-content;
}

.content-wrapper {
  flex: 1;
  margin-top: 8px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  background-color: #f5f5f5;
}
</style>
