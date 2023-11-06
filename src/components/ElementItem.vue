<template>
  <div class="item-wrapper">
    <div class="primary-area">
      <!-- icon -->
      <img
        style="width: 64px; height: 64px; border-radius: 50%"
        :src="'http://127.0.0.1:8080' + element.icon"
      />
      <!-- info -->
      <div class="primary-info">
        <div
          style="font-weight: 600; padding-left: 6px"
          :title="element.alias ? element.alias : '暂无别名'"
        >
          {{ element.alias ? element.alias : '暂无别名' }}
        </div>
        <a style="padding: 6px" :title="element.name">{{ element.name }}</a>
        <div
          style="margin-top: 4px"
          :title="element.ordered ? element.ordered.toString() : '无优先级'"
        >
          <!-- {{ element.ordered ? element.ordered : '无优先级' }} -->
          <a-tag :color="element.ordered ? 'success' : 'warning'" :bordered="false">
            {{ element.ordered ? element.ordered : 'None' }}
          </a-tag>
        </div>
      </div>
    </div>
    <!-- description -->
    <div
      class="description"
      :title="element.description ? element.description : '该组件没有描述信息'"
    >
      {{ element.description ? element.description : '该组件没有描述信息' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  element: {
    id: string
    name: string
    alias?: string | null
    icon: string
    description?: string | null
    ordered?: number | null
    type: string
  }
}>()
</script>

<style scoped>
.item-wrapper {
  width: 192px;
  height: 144px;
  margin: 0 5px;
  padding: 8px;
  cursor: pointer;
  background-color: white;
}

.primary-area {
  height: 80px;
  display: flex;
  flex-direction: row;
}

.primary-info {
  width: 112px;
  height: 64px;
}

.primary-info > div,
a {
  height: 20px;
  line-height: 20px;
  margin: 0px 0px 2px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  height: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
