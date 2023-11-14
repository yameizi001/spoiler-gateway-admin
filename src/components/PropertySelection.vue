<template>
  <div class="selection-wrapper">
    <!-- query -->
    <div class="query-wrapper">
      <a-input-search
        allowClear
        style="width: 160px; flex: 1"
        size="small"
        v-model:value="queryForm.alias"
        placeholder="输入属性别名"
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
        :group="{ name: 'PROPERTY', pull: 'clone', put: false }"
        item-key="id"
        :clone="deepClone"
      >
        <template #item="{ element }">
          <div class="item-wrapper">
            <unordered-list-outlined />
            <div class="item-alias" :title="element.alias">{{ element.alias }}</div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, h } from 'vue'
import { UnorderedListOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import draggable from 'vuedraggable'
import PropertyApi from '../api/element/property'

onMounted(async () => {
  await get()
})

const queryForm = ref<{
  elementId: string
  alias?: string | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  elementId: '-1',
  alias: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const data = ref([])

async function get() {
  const resp = await PropertyApi.getPageablePropertyList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

function deepClone(item: any) {
  const cloned = JSON.parse(JSON.stringify(item))
  cloned.values = ['']
  return cloned
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

.item-wrapper {
  cursor: pointer;
  height: 48px;
  line-height: 48px;
  padding-left: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.item-alias {
  margin-left: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
