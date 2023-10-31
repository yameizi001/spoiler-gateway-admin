<template>
  <div class="content-wrapper">
    <!-- query form -->
    <div class="query-form-wrapper">
      <div class="query-form-item">
        <a-form layout="inline" :model="queryForm">
          <a-form-item label="编码：">
            <a-input allowClear v-model:value="queryForm.name" placeholder="请输入组件编码" />
          </a-form-item>
          <a-form-item label="别名：">
            <a-input allowClear v-model:value="queryForm.alias" placeholder="请输入组件别名" />
          </a-form-item>
          <a-form-item label="顺序: ">
            <a-input-number style="width: 200px" v-model:value="queryForm.ordered" />
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-button danger @click="onClickClearQueryForm" type="link">清空</a-button>
        <a-button @click="onClickQuery" type="link">查询</a-button>
        <a-button type="link" @click="() => (createFormVisible = true)">创建组件</a-button>
      </div>
    </div>
    <!-- create form -->
    <a-modal
      v-model:open="createFormVisible"
      title="创建组件"
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
        <a-form-item name="name" label="编码">
          <a-input style="width: 220px" v-model:value="createForm.name" />
        </a-form-item>
        <a-form-item name="alias" label="别名">
          <a-input style="width: 280px" v-model:value="createForm.alias" />
        </a-form-item>
        <a-form-item name="icon" label="图标">
          <a-upload name="file" list-type="picture-card" :show-upload-list="false">
            <!-- <img v-if="imageUrl" :src="imageUrl" />
            <div v-else> -->
            <loading-outlined v-if="loading"></loading-outlined>
            <upload-outlined v-else></upload-outlined>
            <div style="font-size: 12px">上传图标</div>
            <!-- </div> -->
          </a-upload>
        </a-form-item>
        <a-form-item name="description" label="描述">
          <a-textarea :rows="2" v-model:value="createForm.description" />
        </a-form-item>
        <a-form-item name="ordered" label="顺序">
          <a-input-number style="width: 200px" v-model:value="createForm.ordered" />
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
            <a @click="onClickElement(record)">
              {{ record.name }}
            </a>
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
import { message, Modal } from 'ant-design-vue'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { h, onMounted, ref } from 'vue'
import router from '@/router'
import ElementApi from '../api/element/element'

const props = defineProps({
  elementType: String
})

onMounted(async () => {
  loading.value = true
  await get()
  loading.value = false
})

interface CreateForm {
  name: string
  alias: string
  icon: string
  description?: string | null
  ordered?: number | null
  type?: string | null
}

interface QueryForm {
  name?: string | null
  alias?: string | null
  ordered?: boolean | null
  type?: string | null
  page: {
    num: number
    size: number
    total: number
  }
}

interface ElementRecord {
  id: string
  name: string
  alias: string
  description?: string | null
  icon: string
  ordered?: number | null
  type: string
}

const columns = [
  {
    title: '组件编码',
    key: 'name',
    dataIndex: 'name',
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
    title: '图标',
    key: 'icon',
    dataIndex: 'icon',
    width: 160
  },
  {
    title: '顺序',
    key: 'ordered',
    dataIndex: 'ordered',
    width: 100
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
  alias: '',
  icon: '',
  description: '',
  ordered: null,
  type: null
})

const queryForm = ref<QueryForm>({
  name: null,
  alias: null,
  ordered: null,
  type: null,
  page: {
    num: 1,
    size: 10,
    total: 0
  }
})

const data = ref<ElementRecord[]>([])

async function get() {
  queryForm.value.type = props.elementType ? props.elementType : ''
  const resp = await ElementApi.getPageableElementList(queryForm.value)
  data.value = resp.data.records
  queryForm.value.page.total = resp.data.total
}

const onSubmitCreateForm = async function () {
  createFormLoading.value = true
  let resp
  try {
    createForm.value.type = props.elementType ? props.elementType : ''
    resp = await ElementApi.create(createForm.value)
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
    alias: '',
    icon: '',
    description: '',
    ordered: null,
    type: null
  }
  await get()
}

const onClickDelete = async function (id: string) {
  await ElementApi.remove(id)
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
    name: null,
    alias: null,
    ordered: null,
    type: null,
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

const onClickElement = async function (record: ElementRecord) {
  router.push('/plugin/element/property/' + record.id)
}

const onClickMetadata = async function (record: ElementRecord) {
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
