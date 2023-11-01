<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div v-if="elementId">
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
          <a-form-item label="编码：">
            <a-input allowClear v-model:value="queryForm.key" placeholder="请输入属性编码" />
          </a-form-item>
          <a-form-item label="别名：">
            <a-input allowClear v-model:value="queryForm.alias" placeholder="请输入属性别名" />
          </a-form-item>
          <a-form-item label="必须: ">
            <a-select
              style="width: 80px"
              allowClear
              v-model:value="queryForm.required"
              :options="simpleBooleanOptions"
            />
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-button danger @click="onClickClearQueryForm" type="link">清空</a-button>
        <a-button @click="onClickQuery" type="link">查询</a-button>
        <a-button type="link" @click="() => (createFormVisible = true)">创建属性</a-button>
      </div>
    </div>
    <!-- create form -->
    <a-modal
      v-model:open="createFormVisible"
      title="创建属性"
      ok-text="创建"
      cancel-text="取消"
      :confirm-loading="createFormLoading"
      @ok="onSubmitCreateForm"
    >
      <a-form
        :label-col="{ style: { width: '72px' } }"
        :model="createForm"
        layout="horizontal"
        name="form_in_modal"
      >
        <a-form-item name="key" label="编码: ">
          <a-input style="width: 220px" v-model:value="createForm.key" />
        </a-form-item>
        <a-form-item name="alias" label="别名: ">
          <a-input style="width: 280px" v-model:value="createForm.alias" />
        </a-form-item>
        <a-form-item name="description" label="描述: ">
          <a-textarea :rows="2" v-model:value="createForm.description" />
        </a-form-item>
        <a-form-item name="required" label="必须: ">
          <a-switch size="small" v-model:checked="createForm.required" />
        </a-form-item>
        <a-form-item name="regex" label="校验正则: ">
          <a-input style="width: 220px" v-model:value="createForm.regex" />
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
          <template v-if="column.key === 'required'">
            <a-tag
              style="border-radius: 50%"
              :color="record.secure ? 'success' : 'warning'"
              :bordered="false"
            >
              {{ record.required ? 'Y' : 'N' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <span>
              <a-space wrap>
                <a @click="onClickMetadata(record)">元数据</a>
              </a-space>
              <a-divider type="vertical" />
              <a @click="onClickDelete(record.id)">删除</a>
            </span>
          </template>
        </template>
        <template #emptyText>
          <a-empty description="组件为空，点击右上角[创建组件]开始创建" />
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
import { LeftOutlined } from '@ant-design/icons-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import PropertyApi from '../api/element/property'

const props = defineProps({
  elementId: String
})

onMounted(async () => {
  loading.value = true
  await get()
  loading.value = false
})

interface CreateForm {
  elementId?: string | null
  key?: string | null
  alias: string
  description?: string | null
  required: boolean
  regex?: string | null
}

interface QueryForm {
  elementId?: string | null
  key?: string | null
  alias?: string | null
  required?: boolean | null
  page: {
    num: number
    size: number
    total: number
  }
}

interface PropertyRecord {
  id: string
  elementId?: string | null
  key: string
  alias: string
  description?: string | null
  required: boolean
  regex?: string | null
}

const columns = [
  {
    title: '属性编码',
    key: 'key',
    dataIndex: 'key',
    width: 200
  },
  {
    title: '别名',
    key: 'alias',
    dataIndex: 'alias',
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
    title: '是否必须',
    key: 'required',
    dataIndex: 'required',
    width: 80,
    align: 'center'
  },
  {
    title: '校验正则',
    key: 'regex',
    dataIndex: 'regex',
    width: 200,
    ellipsis: {
      showTitle: true
    }
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
  key: '',
  alias: '',
  description: '',
  required: false,
  regex: ''
})

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

const queryForm = ref<QueryForm>({
  elementId: null,
  key: null,
  alias: null,
  required: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const data = ref<PropertyRecord[]>([])

async function get() {
  queryForm.value.elementId = props.elementId ? props.elementId : '-1'
  const resp = await PropertyApi.getPageablePropertyList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

const onSubmitCreateForm = async function () {
  createFormLoading.value = true
  let resp
  try {
    createForm.value.elementId = props.elementId ? props.elementId : null
    resp = await PropertyApi.create(createForm.value)
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
    key: '',
    alias: '',
    description: '',
    required: false,
    regex: ''
  }
  await get()
}

const onClickDelete = async function (id: string) {
  await PropertyApi.remove(id)
  message.success('删除成功')
  await get()
  if (data.value.length == 0) {
    const pageNum = queryForm.value.page.num
    queryForm.value.page.num = pageNum == 1 ? 1 : pageNum - 1
    await get()
  }
}

const onClickClearQueryForm = async function () {
  queryForm.value = {
    elementId: null,
    key: null,
    alias: null,
    required: null,
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

const onClickMetadata = async function (record: PropertyRecord) {
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
