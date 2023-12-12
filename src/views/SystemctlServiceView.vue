<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div class="query-form-item">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="服务名：">
            <a-input allowClear v-model:value="queryForm.name" placeholder="请输入服务名" />
          </a-form-item>
          <a-form-item label="是否启用：">
            <a-select
              style="width: 80px"
              allowClear
              v-model:value="queryForm.enabled"
              :options="enabledOptions"
            ></a-select>
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-button danger @click="onClickClearQueryForm" type="link">清空</a-button>
        <a-button @click="onClickQuery" type="link">查询</a-button>
        <a-button type="link" @click="() => (createFormVisible = true)">创建服务</a-button>
      </div>
    </div>
    <!-- create form -->
    <a-modal
      v-model:open="createFormVisible"
      title="创建服务"
      ok-text="创建"
      cancel-text="取消"
      :confirm-loading="createFormLoading"
      @ok="onSubmitCreateForm"
    >
      <a-form
        :label-col="{ style: { width: '64px' } }"
        :model="createForm"
        layout="horizontal"
        name="form_in_modal"
      >
        <a-form-item name="name" label="服务名">
          <a-input v-model:value="createForm.name" />
        </a-form-item>
        <a-form-item name="description" label="描述">
          <a-textarea :rows="2" v-model:value="createForm.description" />
        </a-form-item>
        <a-form-item name="metadata" label="元数据">
          <a-textarea :rows="6" v-model:value="createForm.metadata" />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- update form -->
    <a-modal
      v-model:open="updateFormVisible"
      title="编辑服务"
      ok-text="完成"
      cancel-text="取消"
      :maskClosable="false"
      :confirm-loading="updateFormLoading"
      @ok="onSubmitUpdateForm"
    >
      <a-form
        :label-col="{ style: { width: '64px' } }"
        :model="updateForm"
        layout="horizontal"
        name="form_in_modal"
      >
        <a-form-item name="name" label="服务名">
          <a-input v-model:value="updateForm.name" />
        </a-form-item>
        <a-form-item name="description" label="描述">
          <a-textarea :rows="2" v-model:value="updateForm.description" />
        </a-form-item>
        <a-form-item name="metadata" label="元数据">
          <a-textarea :rows="6" v-model:value="updateForm.metadata" />
        </a-form-item>
      </a-form>
    </a-modal>
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
            <a @click="onClickService(record.id)">
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'enabled'">
            <a-switch
              size="small"
              :loading="record.switching"
              :checked="record.enabled"
              @click="onClickSwitch(record)"
            />
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
import { message, Modal, type SelectProps } from 'ant-design-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import to from 'await-to-js'
import ServiceApi from '../api/service/service'

interface ServiceRecord {
  id: string
  name: string
  description?: string | null
  metadata?: JSON | null
  createTime: string
  updateTime: string
  enabled: boolean
  switching: boolean
}

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
    title: '是否启用',
    key: 'enabled',
    dataIndex: 'enabled',
    width: 120,
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 280
  }
]

const enabledOptions = ref<SelectProps['options']>([
  {
    value: 'true',
    label: '启用'
  },
  {
    value: 'false',
    label: '禁用'
  }
])

const queryForm = ref<{
  name?: string | null
  enabled?: boolean | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  name: null,
  enabled: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const loading = ref<boolean>(true)

const data = ref<[]>([])

async function get() {
  loading.value = true
  const [error, resp] = await to(ServiceApi.getPageableServiceList(queryForm.value))
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
    enabled: null,
    page: {
      num: queryForm.value.page.num,
      size: queryForm.value.page.size,
      total: queryForm.value.page.total
    }
  }
}

const onClickService = async function (id: string) {
  router.push('/instance/systemctl/' + id)
}

const onClickSwitch = async function (record: ServiceRecord) {
  record.switching = true
  const enabled = record.enabled
  if (enabled) {
    const [error] = await to(ServiceApi.disable(record.id))
    if (!error) {
      message.success('禁用成功')
    }
  } else {
    const [error] = await to(ServiceApi.enable(record.id))
    if (!error) {
      message.success('启用成功')
    }
  }
  record.switching = false
  await get()
}

const onClickMetadata = async function (record: ServiceRecord) {
  Modal.info({
    width: '500px',
    title: '元数据',
    content: h('div', {}, [h('pre', JSON.stringify(record, null, 2))]),
    footer: null,
    closable: true,
    maskClosable: true
  })
}

const onClickDelete = async function (id: string) {
  const [error] = await to(ServiceApi.remove(id))
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

const onClickEdit = async function (record: ServiceRecord) {
  updateFormVisible.value = true
  const { metadata, ...remain } = record
  const metadataString = metadata ? JSON.stringify(metadata, null, 2) : null
  updateForm.value = {
    metadata: metadataString,
    ...remain
  }
}

const onChangePage = async function () {
  await get()
}

const createFormVisible = ref<boolean>(false)

const createFormLoading = ref<boolean>(false)

const createForm = ref<{
  name: string
  description?: string | null
  metadata?: string | null
}>({
  name: '',
  description: null,
  metadata: null
})

const onSubmitCreateForm = async function () {
  createFormLoading.value = true
  const { metadata, ...remain } = createForm.value
  let resp
  try {
    const metadataJson = metadata ? JSON.parse(metadata!) : null
    resp = await ServiceApi.create({ metadata: metadataJson, ...remain })
  } catch (error) {
    createFormLoading.value = false
    message.error('创建失败，请检查表单')
    return
  }
  if (resp.code === 200) {
    message.success('创建成功')
  } else {
    message.error(resp.data)
  }
  createFormVisible.value = false
  createFormLoading.value = false
  createForm.value = {
    name: '',
    description: null,
    metadata: null
  }
  await get()
}

const updateFormVisible = ref<boolean>(false)

const updateFormLoading = ref<boolean>(false)

const updateForm = ref<{
  id: string
  name: string
  description?: string | null
  metadata?: string | null
}>({
  id: '',
  name: '',
  description: null,
  metadata: null
})

const onSubmitUpdateForm = async function () {
  updateFormLoading.value = true
  const { metadata, ...remain } = updateForm.value
  let resp
  try {
    const metadataJson = metadata ? JSON.parse(metadata!) : null
    resp = await ServiceApi.edit({ metadata: metadataJson, ...remain })
  } catch (error) {
    updateFormLoading.value = false
    message.error('编辑失败，请检查表单')
    return
  }
  if (resp.code === 200) {
    message.success('编辑成功')
  } else {
    message.error(resp.data)
  }
  updateFormVisible.value = false
  updateFormLoading.value = false
  updateForm.value = {
    id: '',
    name: '',
    description: null,
    metadata: null
  }
  await get()
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
