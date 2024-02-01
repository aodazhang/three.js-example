<template>
  <div
    class="taodou-ticket"
    ref="threeRef"
    @click="experience.notify('place', $event)"
  >
    <common-loading v-if="progress < 100" :progress="progress" />
  </div>
  <div v-if="progress >= 100">
    <button class="reset" @click="experience.notify('reset')">相机复位</button>
    <button class="sound" @click="experience.notify('sound')">播放BGM</button>
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
  experience.on<number>('progress', message => (progress.value = message))
})

onUnmounted(() => {
  experience.onDestory()
})
</script>

<style scoped>
.taodou-ticket {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.reset,
.sound {
  position: fixed;
  z-index: 10;
  bottom: 10px;
  padding: 6px 12px;
}

.reset {
  right: 110px;
}

.sound {
  right: 10px;
}
</style>

<style>
.place {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
}
</style>
