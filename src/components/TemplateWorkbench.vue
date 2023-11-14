<template>
  <div class="workbench-wrapper">
    <div class="selection-wrapper">
      <div class="selection-area">
        <accordion-sidebar style="height: 100%" :list="selectionCategory">
          <template #item_0>
            <element-selection style="width: 100%" element-type="PREDICATE" />
          </template>
          <template #item_1>
            <element-selection style="width: 100%" element-type="FILTER" />
          </template>
          <template #item_2>
            <property-selection style="width: 100%" />
          </template>
        </accordion-sidebar>
      </div>
    </div>
    <div class="operation-wrapper">
      <a-form
        id="operationForm"
        style="padding: 24px 12px; height: calc(100% - 48px); overflow-y: auto"
        name="basic"
        :model="templateUpsertForm"
        :label-col="{ style: { width: '64px' } }"
        autocomplete="off"
      >
        <template v-if="props.templateType === 'TEMPLATED'">
          <a-form-item id="templateUpsertFormName" label="模板名: " name="name">
            <a-input style="width: 320px" v-model:value="templateUpsertForm.name" />
          </a-form-item>
          <a-form-item id="templateUpsertFormDescription" label="描述: " name="description">
            <a-textarea
              style="width: 480px"
              :rows="2"
              v-model:value="templateUpsertForm.description"
            />
          </a-form-item>
        </template>
        <a-form-item id="templateUpsertFormPredicates" label="断言器: " name="predicates">
          <div style="width: 80%" class="operation-draggable-wrapper">
            <draggable
              class="operation-draggable"
              animation="500"
              :list="templateUpsertForm.predicates"
              group="PREDICATE"
              item-key="id"
            >
              <template #item="{ element, index }">
                <operation-element-item
                  :element="element"
                  :index="index"
                  @updateElementProperties="updateElementProperties"
                  @removeItem="removeOperationElementItem"
                  @click="onClickOperationElementItem(element)"
                />
              </template>
            </draggable>
          </div>
        </a-form-item>
        <a-form-item id="templateUpsertFormFilters" label="过滤器: " name="filters">
          <div style="width: 80%" class="operation-draggable-wrapper">
            <draggable
              class="operation-draggable"
              animation="500"
              :list="templateUpsertForm.filters"
              group="FILTER"
              item-key="id"
            >
              <template #item="{ element, index }">
                <operation-element-item
                  :element="element"
                  :index="index"
                  @updateElementProperties="updateElementProperties"
                  @removeItem="removeOperationElementItem"
                  @click="onClickOperationElementItem(element)"
                />
              </template>
            </draggable>
          </div>
        </a-form-item>
        <a-form-item id="templateUpsertFormMetadata" label="元数据: " name="metadata">
          <div style="width: 60%" class="operation-draggable-wrapper">
            <draggable
              style="flex-direction: column"
              class="operation-draggable"
              animation="500"
              :list="templateUpsertForm.metadata"
              group="PROPERTY"
              @change="onChangeMetadataDraggableItem"
              item-key="id"
            >
              <template #item="{ element, index }">
                <div class="metadata-item-wrapper">
                  <a-form-item :label="element.alias" name="index">
                    <template v-for="(metadataValue, index) in element.values" :key="index">
                      <a-input
                        style="width: 240px; margin: 0 12px"
                        v-model:value="element.values[index]"
                      />
                    </template>
                    <a-button
                      danger
                      type="link"
                      :icon="h(MinusCircleOutlined)"
                      @click="onClickDeleteMetadataItem(index)"
                    />
                  </a-form-item>
                </div>
              </template>
            </draggable>
          </div>
        </a-form-item>
      </a-form>
      <div class="operation-button-wrapper">
        <a-button type="link" @click="onSubmitElementPropertiesForm">完成</a-button>
        <a-button type="link" danger @click="onClearElementPropertiesForm">清空</a-button>
      </div>
      <div class="affix-wrapper">
        <a-affix :offset-top="0">
          <a-anchor :getContainer="getContainer" :items="anchorItem" />
        </a-affix>
      </div>
      <div
        class="form-wrapper-mask"
        v-show="formVisible"
        @click.stop="
          () => {
            formVisible = false
          }
        "
      ></div>
    </div>
    <transition name="form-wrapper">
      <div class="form-wrapper" v-show="formVisible">
        <div style="text-align: center; font-weight: 600; padding: 12px">
          配置{{ configuredElement ? ' [' + configuredElement.alias + '] ' : '组件' }}属性
        </div>
        <template v-if="configuredElement">
          <a-form
            style="margin-top: 12px"
            name="basic"
            :label-col="{
              style: {
                width: '128px'
              }
            }"
            autocomplete="off"
          >
            <template v-for="(property, index) in configuredElement.properties" :key="index">
              <a-form-item :label="property.alias" name="index">
                <template v-for="(propertyValue, innerIndex) in property.values" :key="innerIndex">
                  <a-input
                    style="width: 240px; margin-bottom: 12px"
                    v-model:value="property.values[innerIndex]"
                  />
                  <template v-if="!property.key && innerIndex !== property.values.length - 1">
                    <a-button
                      danger
                      type="link"
                      :icon="h(MinusCircleOutlined)"
                      @click="onClickDeleteArrayProperty(property.values, innerIndex)"
                    />
                  </template>
                  <template v-else-if="!property.key && innerIndex === property.values.length - 1">
                    <a-button
                      type="link"
                      :icon="h(PlusCircleOutlined)"
                      @click="onClickAddArrayProperty(property)"
                    />
                  </template>
                </template>
              </a-form-item>
            </template>
          </a-form>
        </template>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, onMounted } from 'vue'
import router from '@/router'
import { message } from 'ant-design-vue'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue'
import draggable from 'vuedraggable'
import AccordionSidebar from './AccordionSidebar.vue'
import ElementSelection from './ElementSelection.vue'
import PropertySelection from './PropertySelection.vue'
import OperationElementItem from './OperationElementItem.vue'
import TemplateApi from '../api/template'

export interface ElementRecord {
  id: string
  name: string
  alias: string
  description?: string | null
  icon: string
  ordered?: number | null
  type: string
  properties: PropertyRecord[]
}

export interface PropertyRecord {
  id: string
  elementId?: string | null
  key?: string | null
  alias: string
  description?: string | null
  required: boolean
  regex?: string | null
  values: string[]
}

const props = defineProps({
  templateId: String,
  templateType: {
    type: String,
    required: false,
    default: 'TEMPLATED'
  }
})

async function get() {
  if (props.templateId) {
    const resp = await TemplateApi.getTemplateDetail(props.templateId)
    templateUpsertForm.value = resp.data
  }
}

onMounted(async () => {
  if (props.templateType !== 'TEMPLATED') {
    anchorItem.value.splice(0, 2)
  }
  await get()
})

const selectionCategory = [
  {
    title: '断言器',
    key: 'PREDICATE'
  },
  {
    title: '过滤器',
    key: 'FILTER'
  },
  {
    title: '元数据',
    key: 'METADATA'
  }
]

const anchorItem = ref([
  {
    key: 'name',
    href: '#templateUpsertFormName',
    title: '模板名称'
  },
  {
    key: 'description',
    href: '#templateUpsertFormDescription',
    title: '描述'
  },
  {
    key: 'predicates',
    href: '#templateUpsertFormPredicates',
    title: '断言器列表'
  },
  {
    key: 'filters',
    href: '#templateUpsertFormFilters',
    title: '过滤器列表'
  },
  {
    key: 'metadata',
    href: '#templateUpsertFormMetadata',
    title: '元数据列表'
  }
])

const formVisible = ref(false)

const templateUpsertForm = ref<{
  id: string
  name: string
  description?: string | null
  predicates: ElementRecord[]
  filters: ElementRecord[]
  metadata: PropertyRecord[]
  type: string
}>({
  id: '',
  name: '',
  description: null,
  predicates: [],
  filters: [],
  metadata: [],
  type: 'TEMPLATED'
})

const configuredElement = ref<ElementRecord>()

const getContainer = function () {
  return document.querySelector('#operationForm')
}

const updateElementProperties = async function (
  element: ElementRecord,
  properties: PropertyRecord[]
) {
  properties.forEach((property) => {
    property.values = ['']
  })
  element.properties = properties
}

const removeOperationElementItem = async function (element: ElementRecord, index: number) {
  const type = element.type
  if (type == 'PREDICATE') {
    templateUpsertForm.value.predicates.splice(index, 1)
  } else if (type == 'FILTER') {
    templateUpsertForm.value.filters.splice(index, 1)
  }
}

const onClickOperationElementItem = async function (element: ElementRecord) {
  formVisible.value = true
  configuredElement.value = element
}

const onClickAddArrayProperty = async function (property: PropertyRecord) {
  property.values.push('')
}

const onClickDeleteArrayProperty = async function (properties: string[], index: number) {
  properties.splice(index, 1)
}

const onChangeMetadataDraggableItem = async function () {
  const metadata = templateUpsertForm.value.metadata
  const seenIds: Record<string, boolean> = {}
  templateUpsertForm.value.metadata = metadata.filter((item) => {
    if (seenIds[item.id]) {
      message.error('已经添加了这个属性')
      return false
    } else {
      seenIds[item.id] = true
      return true
    }
  })
}

const onClickDeleteMetadataItem = async function (index: number) {
  const metadata = templateUpsertForm.value.metadata
  metadata.splice(index, 1)
}

const onClearElementPropertiesForm = async function () {
  templateUpsertForm.value = {
    id: '',
    name: '',
    description: null,
    predicates: [],
    filters: [],
    metadata: [],
    type: templateUpsertForm.value.type
  }
}

const onSubmitElementPropertiesForm = async function () {
  templateUpsertForm.value.type = props.templateType
  if (props.templateId) {
    templateUpsertForm.value.id = props.templateId
    await TemplateApi.edit(templateUpsertForm.value)
  } else {
    await TemplateApi.create(templateUpsertForm.value)
  }
  message.success('模板编辑成功')
  router.back()
}
</script>

<style scoped>
:deep(.content-layout) {
  padding: 0;
}

.workbench-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.selection-wrapper {
  width: 256px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.selection-area {
  flex: 1;
  overflow-y: auto;
}

.operation-wrapper {
  position: relative;
  flex: 1;
  background-color: #f5f5f5;
}

.operation-draggable-wrapper {
  height: 460px;
  max-height: 460px;
  min-height: 460px;
  border: 1px dashed grey;
  margin: 4px 0;
  padding: 20px;
}

.operation-draggable {
  height: 415px;
  overflow-y: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
}

.metadata-item-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.metadata-item-label {
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 120px;
}

.metadata-item-label::after {
  content: ': ';
}

.affix-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px 32px 0 0;
}

.operation-button-wrapper {
  width: 100%;
  height: 48px;
  line-height: 48px;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-flow: row-reverse;
  align-items: center;
  padding: 0 12px;
  border-top: 2px solid white;
}

.form-wrapper-mask {
  position: fixed;
  left: 0;
  right: 480px;
  top: 0;
  bottom: 0;
}

.form-wrapper {
  width: 448px;
  height: 100%;
  overflow-y: auto;
  transition: width 0.2s ease;
}

.form-wrapper-enter-active,
.form-wrapper-leave-from {
  width: 1;
}

.form-wrapper-leave-active,
.form-wrapper-enter-from {
  width: 0;
}
</style>
