<template>
  <div class="wrapper">
    <div class="steps-wrapper">
      <a-steps size="small" :current="current" :items="steps" />
    </div>
    <div class="content-wrapper">
      <template v-if="current === 0">
        <div class="config-way-wrapper">
          <div class="config-way-text" style="font-size: large">请选择配置方式</div>
          <div class="config-way-text">
            从下列配置方式中选择一个, 选中任意一项可以查看配置说明,
            选中合适的方式并点击[下一步]开始配置
          </div>
          <div class="config-way-selection">
            <a-radio-group class="config-way-radio-group" v-model:value="configWay">
              <a-radio class="config-way-item" :value="0">代码配置</a-radio>
              <a-radio class="config-way-item" :value="1">组件配置</a-radio>
              <a-radio class="config-way-item" :value="2">模板衍生</a-radio>
              <a-radio class="config-way-item" :value="3">模板配置</a-radio>
            </a-radio-group>
            <div class="config-way-description">
              {{ wayDescriptions[configWay] }}
            </div>
          </div>
          <a-space style="padding: 24px 0" :size="400">
            <a-button @click="onClickCancel">取消</a-button>
            <a-button type="primary" @click="onClickNext">下一步</a-button>
          </a-space>
        </div>
      </template>
      <template v-else>
        <div style="display: flex; flex-direction: column; height: 100%">
          <a-form
            style="flex: 1; display: flex; flex-direction: column; overflow-y: auto"
            :label-col="{ style: { width: '96px' } }"
            :model="createForm"
            layout="horizontal"
            name="form_in_modal"
          >
            <a-form-item name="name" label="路由名">
              <a-input style="width: 300px" v-model:value="createForm.name" />
            </a-form-item>
            <a-form-item name="description" label="描述">
              <a-textarea style="width: 420px" :rows="2" v-model:value="createForm.description" />
            </a-form-item>
            <a-form-item name="serviceId" label="服务选择">
              <a-select
                style="width: 300px"
                allowClear
                v-model:value="createForm.serviceId"
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
            <a-form-item name="ordered" label="顺序">
              <a-input-number style="width: 200px" v-model:value="createForm.ordered" />
            </a-form-item>
            <template v-if="configWay === 0">
              <a-form-item name="predicates" label="断言器代码块">
                <a-textarea style="width: 600px" :rows="7" v-model:value="createForm.predicates" />
              </a-form-item>
              <a-form-item name="filters" label="过滤器代码块">
                <a-textarea style="width: 600px" :rows="7" v-model:value="createForm.filters" />
              </a-form-item>
              <a-form-item name="metadata" label="元数据代码块">
                <a-textarea style="width: 500px" :rows="4" v-model:value="createForm.metadata" />
              </a-form-item>
            </template>
            <template v-if="configWay === 2 || configWay === 3">
              <a-form-item label="模板选择：">
                <a-select
                  style="width: 300px"
                  allowClear
                  v-model:value="createForm.templateId"
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
            </template>
            <template v-if="configWay === 1 || configWay === 2">
              <template-workbench
                style="overflow-y: auto"
                :template-id="createForm.templateId"
                :template-type="'INSTANT'"
              />
            </template>
          </a-form>
          <div
            style="display: flex; flex-direction: row; justify-content: flex-end; margin-top: 12px"
          >
            <a-button @click="onClickCancel">取消</a-button>
            <a-button style="margin-left: 24px" type="primary">完成</a-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import { ref, h, defineComponent, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import TemplateWorkbench from './TemplateWorkbench.vue'
import ServiceApi from '../api/service/service'
import TemplateApi from '../api/template'

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

const props = defineProps({
  routeId: String,
  templateId: String
})

const current = ref<number>(0)

const configWay = ref(1)

watch(
  () => configWay.value,
  (configWay) => {
    if (configWay === 2 || configWay === 3) {
      if (props.templateId && props.templateId !== '-1') {
        createForm.value.templateId = props.templateId
      }
    }
  }
)

const wayDescriptions = ref([
  '网关的开发人员, 对网关的配置十分了解, 可以直接使用json代码编写配置路由组件, 生成全新的路由',
  '网关的管理员或运维人员, 对网关的路由组件比较了解, 可以通过拖拽路由组件进行组合并配置, 生成全新的路由',
  '网关的运维人员, 对网关的路由组件有一定了解, 可以拉取模板进行简单的更改和配置, 从模板衍生新的路由',
  '网关的运维人员或临时操作人员, 不了解网关路由组件及配置, 选择现成的模板直接生成路由或临时路由, 待管理员或运维人员修正'
])

const steps = [
  {
    key: 'config-way',
    title: '配置方式'
  },
  {
    key: 'config-detail',
    title: '配置面板'
  }
]

const onClickCancel = async function () {
  router.back()
}

const onClickNext = async function () {
  if (current.value < steps.length) {
    current.value = current.value + 1
  }
}

const createForm = ref({
  name: '',
  description: '',
  serviceId: '',
  templateId: '',
  predicates: [],
  filters: [],
  metadata: {},
  ordered: 0
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
</script>

<style>
.wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.steps-wrapper {
  margin: 12px;
  padding: 0 25%;
  align-items: center;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  padding: 4px;
  overflow-y: auto;
}

.config-way-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.config-way-text {
  padding: 12px;
}

.config-way-selection {
  display: flex;
  flex-direction: row;
  height: 350px;
  justify-content: center;
  align-items: center;
}

.config-way-description {
  width: 400px;
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
}

.config-way-radio-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.config-way-item {
  margin-top: 12px;
}
</style>
