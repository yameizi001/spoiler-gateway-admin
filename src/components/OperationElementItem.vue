<template>
  <div class="element-wrapper">
    <a-button
      class="invalid-icon"
      title="注意, 属性值或部分属性值非法"
      type="link"
      danger
      :icon="h(ExclamationCircleOutlined)"
      v-show="!valid"
    />
    <a-button class="close-button" type="link" danger :icon="h(CloseCircleOutlined)" />
    <a-image
      width="48px"
      height="48px"
      class="icon-img"
      :preview="false"
      :src="'http://127.0.0.1:8080' + element.icon"
    />
    <div class="primary-info">
      <div class="primary-info-item" style="font-weight: bold">{{ element.alias }}</div>
      <div class="primary-info-item">
        <a>{{ element.name }}</a>
      </div>
      <a-tag :color="element.ordered ? 'success' : 'warning'" :bordered="false">
        {{ element.ordered ? element.ordered : 'None' }}
      </a-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, onMounted, ref, type PropType, watch } from 'vue'
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import ProPertyApi from '../api/element/property'

export interface ElementRecord {
  id: string
  name: string
  alias: string
  description?: string | null
  icon: string
  ordered?: number | null
  type: string
  properties?: PropertyRecord[] | null
}

export interface PropertyRecord {
  id: string
  elementId?: string | null
  key: string
  alias: string
  description?: string | null
  required: boolean
  regex?: string | null
  values?: string | null
}

const emit = defineEmits(['updateElementProperties'])

const props = defineProps({
  element: {
    type: Object as PropType<ElementRecord>,
    required: true
  }
})

onMounted(async () => {
  const resp = await ProPertyApi.getPageablePropertyList({
    elementId: props.element.id,
    page: {
      num: 1,
      size: Number.MAX_SAFE_INTEGER
    }
  })
  emit('updateElementProperties', props.element, resp.data.records)
})

const valid = ref(false)

watch(
  () => props.element.properties,
  (properties) => {
    console.log(properties)
    let hasReturned = false
    properties?.forEach((property) => {
      const values = property.values
      if (!values && property.required) {
        valid.value = false
        hasReturned = true
        return
      }
      if (property.regex) {
        const regex = new RegExp(property.regex)
        if (!regex.test(values!)) {
          valid.value = false
          hasReturned = true
          return
        }
      }
      if (hasReturned) {
        return
      }
    })
    if (!hasReturned) {
      valid.value = true
    }
  }
)
</script>

<style scoped>
.element-wrapper {
  position: relative;
  cursor: pointer;
  width: 196px;
  height: 128px;
  display: flex;
  flex-direction: row;
  margin: 8px 0 0 8px;
  background-color: white;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.invalid-icon {
  position: absolute;
  top: 0;
  left: 0;
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
}

.primary-info {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
}

.primary-info-item {
  cursor: pointer;
  flex: 1;
  margin: 2px 0 2px 6px;
}
</style>
