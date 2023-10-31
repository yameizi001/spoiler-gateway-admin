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
      <a-form :model="createForm" layout="vertical" name="form_in_modal">
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
      <a-form :model="updateForm" layout="vertical" name="form_in_modal">
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
            <a @click="onClickService(record)">
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
    <a-pagination
      v-model:current="queryForm.page.num"
      :total="queryForm.page.total"
      show-less-items
      @change="onChangePage"
    />
  </div>
</template>

<script lang="ts" setup>
import { message, Modal, type SelectProps } from 'ant-design-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import ServiceApi from '../api/service/service'

onMounted(async () => {
  loading.value = true
  await get()
  loading.value = false
})

interface CreateForm {
  name: string
  description?: string | null
  metadata?: string | null
}

interface UpdateForm {
  id: string
  name: string
  description?: string | null
  metadata?: string | null
}

interface QueryForm {
  name?: string | null
  enabled?: boolean | null
  page: {
    num: number
    size: number
    total: number
  }
}

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
    title: '服务描述',
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
    width: 120
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 280
  }
]

const loading = ref<boolean>(true)

const createFormVisible = ref<boolean>(false)

const createFormLoading = ref<boolean>(false)

const createForm = ref<CreateForm>({
  name: '',
  description: null,
  metadata: null
})

const updateFormVisible = ref<boolean>(false)

const updateFormLoading = ref<boolean>(false)

const updateForm = ref<UpdateForm>({
  id: '',
  name: '',
  description: null,
  metadata: null
})

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

const queryForm = ref<QueryForm>({
  name: null,
  enabled: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const data = ref<ServiceRecord[]>([])

async function get() {
  const resp = await ServiceApi.getPageableServiceList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

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

const onClickDelete = async function (id: string) {
  await ServiceApi.remove(id)
  message.success('删除成功')
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

const onClickSwitch = async function (record: ServiceRecord) {
  record.switching = true
  const enabled = record.enabled
  if (enabled) {
    await ServiceApi.disable(record.id)
    message.success('禁用成功')
  } else {
    await ServiceApi.enable(record.id)
    message.success('启用成功')
  }
  record.switching = false
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

const onClickQuery = async function () {
  await get()
}

const onClickService = async function (record: ServiceRecord) {
  router.push('/instance/systemctl/' + record.id)
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

const onChangePage = async function () {
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
</style>
