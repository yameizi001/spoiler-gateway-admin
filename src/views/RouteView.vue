<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div class="query-form-item">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="路由名：">
            <a-input allowClear v-model:value="queryForm.name" placeholder="请输入路由名" />
          </a-form-item>
          <a-form-item label="服务：">
            <a-select
              style="width: 200px"
              allowClear
              v-model:value="queryForm.serviceId"
              show-search
              placeholder="请输入服务名"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="'暂无此服务'"
              :options="services"
              @search="onSearchSevice"
            >
              <template #dropdownRender="{ menuNode: menu }">
                <v-nodes :vnodes="menu" />
                <a-divider style="margin: 4px 0" />
                <div style="display: flex; flex-direction: row; justify-content: space-around">
                  <a-button
                    type="link"
                    :icon="h(LeftOutlined)"
                    @click="onClickServicePrev"
                  ></a-button>
                  <a-button
                    type="link"
                    :icon="h(RightOutlined)"
                    @click="onClickServiceNext"
                  ></a-button>
                </div>
              </template>
            </a-select>
          </a-form-item>
          <a-form-item label="模板：">
            <a-select
              style="width: 200px"
              allowClear
              v-model:value="queryForm.templateId"
              show-search
              placeholder="请输入模板名"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="'暂无此模板'"
              :options="templates"
              @search="onSearchTemplate"
            >
              <template #dropdownRender="{ menuNode: menu }">
                <v-nodes :vnodes="menu" />
                <a-divider style="margin: 4px 0" />
                <div style="display: flex; flex-direction: row; justify-content: space-around">
                  <a-button
                    title="上一页"
                    type="link"
                    :icon="h(LeftOutlined)"
                    @click="onClickTemplatePrev"
                  ></a-button>
                  <a-button
                    title="下一页"
                    type="link"
                    :icon="h(RightOutlined)"
                    @click="onClickTemplateNext"
                  ></a-button>
                </div>
              </template>
            </a-select>
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
        <a-button type="link" @click="onClickCreate">创建路由</a-button>
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
            <a @click="onClickEdit(record)">
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'templateName'">
            <template v-if="!record.templateName">
              <a-tag style="border-radius: 50%" color="warning" :bordered="false"> N </a-tag>
            </template>
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
          <a-empty description="路由为空，点击右上角[创建路由]开始创建" />
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
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { defineComponent, h, onMounted, ref } from 'vue'
import ServiceApi from '../api/service/service'
import TemplateApi from '../api/template'
import RouteApi from '../api/route'
import router from '@/router'

const VNodes = defineComponent({
  props: {
    vnodes: {
      type: Object,
      required: true
    }
  },
  render() {
    return this.vnodes
  }
})

onMounted(async () => {
  loading.value = true
  await get()
  loading.value = false
})

export interface QueryItem {
  name: string
  args?: string | null
}

export interface QueryForm {
  id?: string | null
  serviceId?: string | null
  templateId?: string | null
  name?: string | null
  predicateQueries?: QueryItem[] | null
  filterQueries?: QueryItem[] | null
  metadataQueries?: QueryItem[] | null
  enabled?: boolean | null
  page: {
    num: number
    size: number
    total: number
  }
}

export interface ElementRecord {
  name: string
  args?: JSON | null
}

export interface RouteRecord {
  id: string
  serviceId: string
  serviceName: string
  templateId?: string | null
  templateName?: string | null
  name: string
  description?: string | null
  predicates?: ElementRecord[] | null
  filters?: ElementRecord[] | null
  ordered: number
  metadata?: JSON | null
  createTime: string
  updateTime: string
  enabled: boolean
  switching: boolean
}

const columns = [
  {
    title: '路由名称',
    key: 'name',
    dataIndex: 'name',
    width: 180,
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
    title: '服务',
    key: 'serviceName',
    dataIndex: 'serviceName',
    width: 180,
    ellipsis: {
      showTitle: true
    }
  },
  {
    title: '模板',
    key: 'templateName',
    dataIndex: 'templateName',
    width: 180,
    ellipsis: {
      showTitle: true
    }
  },
  {
    title: '顺序',
    key: 'ordered',
    dataIndex: 'ordered',
    width: 100,
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createTime',
    dataIndex: 'createTime',
    width: 200
  },
  {
    title: '修改时间',
    key: 'updateTime',
    dataIndex: 'updateTime',
    width: 200
  },
  {
    title: '是否启用',
    key: 'enabled',
    dataIndex: 'enabled',
    width: 100,
    align: 'center'
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 160,
    align: 'center'
  }
]

const loading = ref<boolean>(true)

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

const services = ref([])

const serviceQueryForm = ref({
  name: '',
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

async function fetchServices(input: string) {
  if (input) {
    serviceQueryForm.value.name = input
    const resp = await ServiceApi.getPageableServiceList(serviceQueryForm.value)
    services.value = resp.data.records.map((item: { name: any; id: any }) => {
      return { label: item.name, value: item.id }
    })
    serviceQueryForm.value.page.total = resp.data.total
  }
}

const onSearchSevice = async (input: string) => {
  await fetchServices(input)
}

const onClickServicePrev = async () => {
  if (serviceQueryForm.value.page.num === 1) {
    message.error('已经是第一页了!')
    return
  }
  serviceQueryForm.value.page.num = serviceQueryForm.value.page.num - 1
  await fetchServices(serviceQueryForm.value.name)
}

const onClickServiceNext = async () => {
  if (
    serviceQueryForm.value.page.num * serviceQueryForm.value.page.size >=
    serviceQueryForm.value.page.total
  ) {
    message.error('已经是最后一页了!')
    return
  }
  serviceQueryForm.value.page.num = serviceQueryForm.value.page.num + 1
  await fetchServices(serviceQueryForm.value.name)
}

const templates = ref([])

const templateQueryForm = ref({
  name: '',
  type: 'TEMPLATED',
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

async function fetchTemplates(input: string) {
  if (input) {
    templateQueryForm.value.name = input
    const resp = await TemplateApi.getPageableTemplateList(templateQueryForm.value)
    templates.value = resp.data.records.map((item: { name: any; id: any }) => {
      return { label: item.name, value: item.id }
    })
    templateQueryForm.value.page.total = resp.data.total
  }
}

const onSearchTemplate = async (input: string) => {
  await fetchTemplates(input)
}

const onClickTemplatePrev = async () => {
  if (templateQueryForm.value.page.num === 1) {
    message.error('已经是第一页了!')
    return
  }
  templateQueryForm.value.page.num = templateQueryForm.value.page.num - 1
  await fetchServices(templateQueryForm.value.name)
}

const onClickTemplateNext = async () => {
  if (
    templateQueryForm.value.page.num * templateQueryForm.value.page.size >=
    templateQueryForm.value.page.total
  ) {
    message.error('已经是最后一页了!')
    return
  }
  templateQueryForm.value.page.num = templateQueryForm.value.page.num + 1
  await fetchServices(templateQueryForm.value.name)
}

const onClickCreate = async function () {
  router.push('/route/workbench')
}

const onClickEdit = async function (record: any) {
  router.push(
    '/route/workbench?routeId=' +
      record.id +
      '&serviceId=' +
      record.serviceId +
      '&serviceName=' +
      record.serviceName +
      '&templateId=' +
      record.templateId +
      '&templateName=' +
      record.templateName
  )
}

const data = ref<RouteRecord[]>([])

async function get() {
  const resp = await RouteApi.getPageableServiceList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

const onClickDelete = async function (id: string) {
  await RouteApi.remove(id)
  message.success('删除成功')
  await get()
  if (data.value.length == 0) {
    const pageNum = queryForm.value.page.num
    queryForm.value.page.num = pageNum == 1 ? 1 : pageNum - 1
    await get()
  }
}

const onClickSwitch = async function (record: RouteRecord) {
  record.switching = true
  const enabled = record.enabled
  if (enabled) {
    await RouteApi.disable(record.id)
    message.success('禁用成功')
  } else {
    await RouteApi.enable(record.id)
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

const onClickMetadata = async function (record: RouteRecord) {
  Modal.info({
    width: '720px',
    centered: true,
    title: '元数据',
    content: h('div', {}, [
      h(
        'pre',
        {
          style: {
            height: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        },
        JSON.stringify(record, null, 2)
      )
    ]),
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
