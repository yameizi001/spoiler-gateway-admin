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
        :label-col="{ style: { width: '48px' } }"
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
          <a-upload
            name="file"
            list-type="picture-card"
            :file-list="fileList"
            :show-upload-list="false"
            :before-upload="beforeUpload"
          >
            <div v-if="filePath">
              <img
                style="width: 64px"
                title="点击删除"
                :src="'http://127.0.0.1:8080' + filePath"
                @click.stop="onClickRemoveUpload"
              />
              <div style="font-size: 12px">点击删除</div>
            </div>
            <div v-else>
              <loading-outlined v-if="uploading"></loading-outlined>
              <upload-outlined v-else></upload-outlined>
              <div style="font-size: 12px">{{ uploading ? '上传中...' : '上传图标' }}</div>
            </div>
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
            <a @click="onClickElement(record.id)">
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'icon'">
            <a-image :width="64" :src="'http://127.0.0.1:8080' + record.icon" />
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
import { message, Modal, type UploadProps } from 'ant-design-vue'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { h, onMounted, ref, watch } from 'vue'
import router from '@/router'
import to from 'await-to-js'
import ElementApi from '../api/element/element'

const props = defineProps({
  elementType: String
})

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
    width: 160,
    align: 'center'
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
    size: 10,
    total: 0
  }
})

const loading = ref<boolean>(true)

const data = ref<ElementRecord[]>([])

async function get() {
  loading.value = true
  queryForm.value.type = props.elementType ? props.elementType : ''
  const pageNum = queryForm.value.page.num
  queryForm.value.page.num = pageNum > 0 ? pageNum : 1
  const [error, resp] = await to(ElementApi.getPageableElementList(queryForm.value))
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

const onClickElement = async function (id: string) {
  router.push('/plugin/element/property/' + id)
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

const onClickDelete = async function (id: string) {
  const [error] = await to(ElementApi.remove(id))
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

const fileList = ref<UploadProps['fileList']>([])

const uploading = ref<boolean>(false)

const filePath = ref<string>('')

watch(
  () => fileList.value,
  async (files) => {
    if (files && files.length > 0) {
      uploading.value = true
      let resp
      try {
        resp = await ElementApi.upload(files[0])
      } catch (error) {
        uploading.value = false
        fileList.value = []
        message.error('上传失败')
        return
      }
      uploading.value = false
      fileList.value = []
      if (resp.code === 200) {
        message.success('上传成功')
        filePath.value = resp.data
      } else {
        message.error(resp.data)
      }
    }
  }
)

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImg =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/ico' ||
    file.type === 'image/svg'
  if (!isImg) {
    message.error('请上传正确的图片格式')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片过大')
  }
  if (!isImg || !isLt2M) {
    fileList.value = []
  }
  fileList.value = [...(fileList.value || []), file]
  return false
}

const onClickRemoveUpload = async function () {
  let resp
  try {
    resp = await ElementApi.removeUpload(filePath.value)
  } catch (error) {
    message.error('图片删除失败')
    return
  }
  if (resp.code === 200) {
    message.success('删除成功')
    filePath.value = resp.data
  } else {
    message.error(resp.data)
  }
  filePath.value = ''
  fileList.value = []
}

const createFormVisible = ref<boolean>(false)

const createFormLoading = ref<boolean>(false)

const createForm = ref<{
  name: string
  alias: string
  icon: string
  description?: string | null
  ordered?: number | null
  type?: string | null
}>({
  name: '',
  alias: '',
  icon: '',
  description: null,
  ordered: null,
  type: null
})

const onSubmitCreateForm = async function () {
  createFormLoading.value = true
  let resp
  try {
    createForm.value.icon = filePath.value
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
    description: null,
    ordered: null,
    type: null
  }
  filePath.value = ''
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
