<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div class="query-form-item">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="模板名：">
            <a-input allowClear v-model:value="queryForm.name" placeholder="请输入模板名" />
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-button danger @click="onClickClearQueryForm" type="link">清空</a-button>
        <a-button @click="onClickQuery" type="link">查询</a-button>
        <a-button type="link" @click="onClickCreate">创建模板</a-button>
      </div>
    </div>
    <!-- table -->
    <div class="table-wrapper">
      <a-table
        size="middle"
        :loading="loading"
        :scroll="{ y: 'calc(100vh - 246px)' }"
        :pagination="false"
        :row-key="(record: any) => record.id"
        :columns="columns"
        :data-source="data"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a @click="onClickTemplate(record)">
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'operation'">
            <span>
              <a-space wrap>
                <a @click="onClickMetadata(record)">元数据</a>
              </a-space>
              <a-divider type="vertical" />
              <a @click="onClickEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a @click="onClickDelete(record.id)">删除</a>
            </span>
          </template>
        </template>
        <template #emptyText>
          <a-empty description="服务为空，点击右上角[创建服务]开始创建" />
        </template>
      </a-table>
    </div>
    <!-- page -->
    <div class="page-wrapper">
      <a-pagination
        v-model:current="queryForm.page.num"
        :total="queryForm.page.total"
        show-less-items
        @change="onChangePage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import to from 'await-to-js'
import TemplateApi from '../api/template'

interface TemplateRecord {
  id: string
  name: string
  description?: string | null
  createTime: string
  updateTime: string
}

const type = 'TEMPLATED'

const columns = [
  {
    title: '服务名称',
    key: 'name',
    dataIndex: 'name',
    width: 280,
    ellipsis: {
      showTitle: true
    }
  },
  {
    title: '描述',
    key: 'description',
    dataIndex: 'description',
    ellipsis: {
      showTitle: true
    }
  },
  {
    title: '创建时间',
    key: 'createTime',
    dataIndex: 'createTime',
    width: 240
  },
  {
    title: '修改时间',
    key: 'updateTime',
    dataIndex: 'updateTime',
    width: 240
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 280
  }
]

const queryForm = ref<{
  name?: string | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  name: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const loading = ref<boolean>(true)

const data = ref<TemplateRecord[]>([])

async function get() {
  loading.value = true
  const pageNum = queryForm.value.page.num
  queryForm.value.page.num = pageNum > 0 ? pageNum : 1
  const [error, resp] = await to(
    TemplateApi.getPageableTemplateList({
      type: type,
      ...queryForm.value
    })
  )
  if (error) {
    loading.value = false
    return
  }
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
  loading.value = false
}

onMounted(async () => {
  await get()
})

const onClickQuery = async function () {
  await get()
}

const onClickClearQueryForm = async function () {
  queryForm.value = {
    name: null,
    page: {
      num: queryForm.value.page.num,
      size: queryForm.value.page.size,
      total: queryForm.value.page.total
    }
  }
}

const onClickTemplate = async function (record: TemplateRecord) {
  router.push('/template/workbench/' + record.id)
}

const onClickMetadata = async function (record: TemplateRecord) {
  Modal.info({
    width: '500px',
    title: '元数据',
    content: h('div', {}, [h('pre', JSON.stringify(record, null, 2))]),
    footer: null,
    closable: true,
    maskClosable: true
  })
}

const onClickEdit = async function (record: TemplateRecord) {
  router.push('/template/workbench/' + record.id)
}

const onClickDelete = async function (id: string) {
  const [error] = await to(TemplateApi.remove(id))
  if (!error) {
    message.success('删除成功')
  }
  await get()
  if (data.value.length == 0) {
    const pageNum = queryForm.value.page.num
    queryForm.value.page.num = pageNum == 1 ? 1 : pageNum - 1
    await get()
  }
}

const onChangePage = async function () {
  await get()
}

const onClickCreate = async function () {
  router.push('/template/workbench')
}
</script>

<style scoped>
.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.query-form-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.query-form-item {
  flex: 1;
}

.table-wrapper {
  flex: 1;
  padding: 12px 0;
  text-align: center;
}

.page-wrapper {
  display: flex;
  justify-content: end;
}
</style>
