<template>
  <div class="china-map" ref="threeRef">
    <common-loading v-if="progress < 100" :progress="progress" />
  </div>
  <div class="control" v-if="progress >= 100">
    <button @click="experience.notify('boundary')">边界线</button>
    <button @click="experience.notify('mark')">标记点</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import CommonLoading from '@/components/common-loading.vue'
import Experience from './three/Experience'

let experience: Experience = null
const threeRef = ref<HTMLDivElement>()
const progress = ref(0)

onMounted(() => {
  experience = new Experience(threeRef.value)
  experience.on<number>('progress', message => {
    progress.value = message
  })
  experience.onConfig()
})

onUnmounted(() => {
  experience.onDestory()
})
</script>

<style scoped>
.china-map {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.control button {
  position: fixed;
  z-index: 10;
  bottom: 10px;
  padding: 6px 12px;
}

.control button:nth-child(1) {
  right: 10px;
}

.control button:nth-child(2) {
  right: 90px;
}
</style>
