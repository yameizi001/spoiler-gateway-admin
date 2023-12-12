<template>
  <div class="accordion-wrapper">
    <template v-for="(item, index) in list" :key="index">
      <div class="item-title" @click="onClickTitle(index)">
        <div style="flex: 1">{{ item.title }}</div>
        <template v-if="activeKey === index">
          <down-outlined />
        </template>
        <template v-else>
          <left-outlined />
        </template>
      </div>
      <transition name="item-content">
        <div class="item-content" v-show="activeKey === index">
          <slot :name="`item_${index}`"></slot>
        </div>
      </transition>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { LeftOutlined, DownOutlined } from '@ant-design/icons-vue'

interface Item {
  title?: string | null
  key: string
}

defineProps({
  list: {
    type: Array<Item>,
    default: () => []
  }
})

const activeKey = ref(0)

const onClickTitle = async function (index: number) {
  activeKey.value = index
}
</script>

<style scoped>
.accordion-wrapper {
  display: flex;
  flex-direction: column;
}

.item-title {
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  display: flex;
  padding: 0 4px;
  flex-direction: row;
}

.item-title:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.item-content {
  flex: 1;
  overflow: hidden;
  padding: 4px;
  transition: flex 0.2s ease;
}

.item-content-enter-active {
  flex: 1;
}

.item-content-leave-active {
  flex: 0;
}
</style>
