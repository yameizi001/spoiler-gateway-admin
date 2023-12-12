<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div>
        <a-button
          style="padding-left: 0px"
          type="link"
          :icon="h(LeftOutlined)"
          @click="() => router.go(-1)"
          >返回</a-button
        >
      </div>
      <div class="query-form-item">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="实例名: ">
            <a-input allowClear v-model:value="queryForm.name" placeholder="请输入实例名" />
          </a-form-item>
          <a-form-item label="协议: ">
            <a-input
              style="width: 120px"
              allowClear
              v-model:value="queryForm.scheme"
              placeholder="请输入协议"
            />
          </a-form-item>
          <a-form-item label="SSL: ">
            <a-select
              style="width: 80px"
              allowClear
              v-model:value="queryForm.secure"
              :options="simpleBooleanOptions"
            />
          </a-form-item>
          <a-form-item label="主机: ">
            <a-input
              style="width: 145px"
              allowClear
              v-model:value="queryForm.host"
              placeholder="请输入主机"
            />
          </a-form-item>
          <a-form-item label="端口: ">
            <a-input-number v-model:value="queryForm.port" :min="80" :max="65535" />
          </a-form-item>
          <a-form-item label="健康状态: ">
            <a-select
              style="width: 80px"
              allowClear
              v-model:value="queryForm.health"
              :options="healthOptions"
            />
          </a-form-item>
          <a-form-item label="是否启用: ">
            <a-select
              style="width: 80px"
              allowClear
              v-model:value="queryForm.enabled"
              :options="simpleBooleanOptions"
            />
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-button danger type="link" @click="onClickClearQueryForm">清空</a-button>
        <a-button type="link" @click="onClickQuery">查询</a-button>
        <a-button type="link" @click="() => (createFormVisible = true)">创建实例</a-button>
      </div>
    </div>
    <!-- create form -->
    <a-modal
      v-model:open="createFormVisible"
      title="创建实例"
      ok-text="创建"
      cancel-text="取消"
      :maskClosable="true"
      :confirm-loading="createFormLoading"
      @ok="onSubmitCreateForm"
    >
      <a-form
        :label-col="{ style: { width: '64px' } }"
        :model="createForm"
        layout="horizontal"
        name="form_in_modal"
      >
        <a-form-item style="width: 400px" name="name" label="实例名">
          <a-input v-model:value="createForm.name" />
        </a-form-item>
        <a-form-item style="width: 180px" name="scheme" label="协议">
          <a-input v-model:value="createForm.scheme" />
        </a-form-item>
        <a-form-item name="secure" label="SSL">
          <a-switch size="small" v-model:checked="createForm.secure" />
        </a-form-item>
        <a-form-item style="width: 280px" name="host" label="主机">
          <a-input v-model:value="createForm.host" />
        </a-form-item>
        <a-form-item name="port" label="端口">
          <a-input-number v-model:value="createForm.port" :min="80" :max="65535" />
        </a-form-item>
        <a-form-item name="weight" label="权重">
          <a-input-number v-model:value="createForm.weight" :min="1" :max="100" />
        </a-form-item>
        <a-form-item name="metadata" label="元数据">
          <a-textarea :rows="6" v-model:value="createForm.metadata" />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- update form -->
    <a-modal
      v-model:open="updateFormVisible"
      title="编辑实例"
      ok-text="完成"
      cancel-text="取消"
      :maskClosable="true"
      :confirm-loading="updateFormLoading"
      @ok="onSubmitUpdateForm"
    >
      <a-form
        :label-col="{ style: { width: '64px' } }"
        :model="updateForm"
        layout="horizontal"
        name="form_in_modal"
      >
        <a-form-item style="width: 400px" name="name" label="实例名">
          <a-input v-model:value="updateForm.name" />
        </a-form-item>
        <a-form-item style="width: 180px" name="scheme" label="协议">
          <a-input v-model:value="updateForm.scheme" />
        </a-form-item>
        <a-form-item name="secure" label="SSL">
          <a-switch size="small" v-model:checked="updateForm.secure" />
        </a-form-item>
        <a-form-item style="width: 280px" name="host" label="主机">
          <a-input v-model:value="updateForm.host" />
        </a-form-item>
        <a-form-item name="port" label="端口">
          <a-input-number v-model:value="updateForm.port" :min="80" :max="65535" />
        </a-form-item>
        <a-form-item name="weight" label="权重">
          <a-input-number v-model:value="updateForm.weight" :min="1" :max="100" />
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
          <template v-if="column.key === 'scheme'">
            <a-tag :color="record.scheme ? 'success' : 'warning'" :bordered="false">
              {{ record.scheme ? record.scheme : 'None' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'secure'">
            <a-tag
              style="border-radius: 50%"
              :color="record.secure ? 'success' : 'warning'"
              :bordered="false"
            >
              {{ record.secure ? 'Y' : 'N' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'health'">
            <a-tag
              :color="
                record.health === undefined || record.health === null
                  ? 'warning'
                  : record.health
                  ? 'success'
                  : 'error'
              "
              :bordered="false"
            >
              {{
                record.health === undefined || record.health === null
                  ? '未知'
                  : record.health
                  ? '健康'
                  : '不健康'
              }}
            </a-tag>
          </template>
          <template v-if="column.key === 'enabled'">
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
          <a-empty description="实例为空，点击右上角[创建实例]开始创建" />
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
import { Modal, message, type SelectProps } from 'ant-design-vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import to from 'await-to-js'
import InstanceApi from '../api/service/instance'

const props = defineProps({
  serviceId: String
})

interface InstanceRecord {
  id: string
  serviceId: string
  name: string
  scheme?: string | null
  secure: boolean
  host: string
  port: number
  weight: number
  health?: boolean | null
  metadata?: JSON | null
  createTime: string
  updateTime: string
  enabled: boolean
  switching: boolean
}

const columns = [
  {
    title: '实例名称',
    key: 'name',
    dataIndex: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '协议',
    key: 'scheme',
    dataIndex: 'scheme',
    width: 80,
    align: 'center'
  },
  {
    title: 'SSL',
    key: 'secure',
    dataIndex: 'secure',
    width: 80,
    align: 'center'
  },
  {
    title: '主机',
    key: 'host',
    dataIndex: 'host',
    width: 180
  },
  {
    title: '端口',
    key: 'port',
    dataIndex: 'port',
    width: 100,
    align: 'center'
  },
  {
    title: '权重',
    key: 'weight',
    dataIndex: 'weight',
    width: 80,
    align: 'center'
  },
  {
    title: '健康状态',
    key: 'health',
    dataIndex: 'health',
    width: 100,
    align: 'center'
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
    width: 80,
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 280
  }
]

const simpleBooleanOptions = ref<SelectProps['options']>([
  {
    value: 'true',
    label: '是'
  },
  {
    value: 'false',
    label: '否'
  }
])

const healthOptions = ref<SelectProps['options']>([
  {
    value: 'true',
    label: '健康'
  },
  {
    value: 'false',
    label: '异常'
  }
])

const queryForm = ref<{
  name?: string | null
  scheme?: string | null
  secure?: boolean | null
  host?: string | null
  port?: number | null
  health?: boolean | null
  enabled?: boolean | null
  page: {
    num: number
    size: number
    total: number
  }
}>({
  name: null,
  scheme: null,
  secure: null,
  host: null,
  port: null,
  health: null,
  enabled: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const loading = ref<boolean>(false)

const data = ref<InstanceRecord[]>([])

async function get() {
  loading.value = true
  const pageNum = queryForm.value.page.num
  queryForm.value.page.num = pageNum > 0 ? pageNum : 1
  const [error, resp] = await to(InstanceApi.getPageableInstanceList(queryForm.value))
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
    scheme: null,
    secure: null,
    host: null,
    port: null,
    health: null,
    enabled: null,
    page: {
      num: queryForm.value.page.num,
      size: queryForm.value.page.size,
      total: queryForm.value.page.total
    }
  }
}

const onClickSwitch = async function (record: InstanceRecord) {
  record.switching = true
  const enabled = record.enabled
  if (enabled) {
    const [error] = await to(InstanceApi.disable(record.id))
    if (!error) {
      message.success('禁用成功')
    }
  } else {
    const [error] = await to(InstanceApi.enable(record.id))
    if (!error) {
      message.success('启用成功')
    }
  }
  record.switching = false
  await get()
}

const onClickMetadata = async function (record: InstanceRecord) {
  Modal.info({
    width: '500px',
    title: '元数据',
    content: h('div', {}, [h('pre', JSON.stringify(record, null, 2))]),
    footer: null,
    closable: true,
    maskClosable: true
  })
}

const onClickEdit = async function (record: InstanceRecord) {
  updateFormVisible.value = true
  const { metadata, ...remain } = record
  const metadataString = metadata ? JSON.stringify(metadata, null, 2) : null
  updateForm.value = { metadata: metadataString, ...remain }
}

const onClickDelete = async function (id: string) {
  const [error] = await to(InstanceApi.remove(id))
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

const createFormVisible = ref<boolean>(false)

const createFormLoading = ref<boolean>(false)

const createForm = ref<{
  serviceId: string
  name: string
  scheme?: string | null
  secure: boolean
  host: string
  port: number
  weight: number
  metadata?: string | null
}>({
  serviceId: '',
  name: '',
  scheme: null,
  secure: false,
  host: '',
  port: 8080,
  weight: 1,
  metadata: null
})

const onSubmitCreateForm = async function () {
  createFormLoading.value = true
  let resp
  try {
    createForm.value.serviceId = props.serviceId ? props.serviceId : ''
    let { metadata, ...remain } = createForm.value
    const metadataJson = metadata ? JSON.parse(metadata!) : null
    resp = await InstanceApi.create({ metadata: metadataJson, ...remain })
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
    serviceId: '',
    name: '',
    scheme: null,
    secure: false,
    host: '',
    port: 8080,
    weight: 1,
    metadata: null
  }
  await get()
}

const updateFormVisible = ref<boolean>(false)

const updateFormLoading = ref<boolean>(false)

const updateForm = ref<{
  id: string
  name: string
  scheme?: string | null
  secure: boolean
  host: string
  port: number
  weight: number
  metadata?: string | null
}>({
  id: '',
  name: '',
  scheme: null,
  secure: false,
  host: '',
  port: 8080,
  weight: 1,
  metadata: null
})

const onSubmitUpdateForm = async function () {
  updateFormLoading.value = true
  let resp
  try {
    let { metadata, ...remain } = updateForm.value
    const metadataJson = metadata ? JSON.parse(metadata!) : null
    resp = await InstanceApi.edit({ metadata: metadataJson, ...remain })
  } catch (error) {
    createFormLoading.value = false
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
    scheme: null,
    secure: false,
    host: '',
    port: 8080,
    weight: 1,
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
  line-height: 32px;
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
