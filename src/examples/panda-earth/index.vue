<template>
  <div
    class="panda-earth"
    ref="threeRef"
    @click="progress >= 100 && experience.notify('select', $event)"
  >
    <common-loading v-if="progress < 100" :progress="progress" />
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
.panda-earth {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

<style>
.mark {
  width: 60px;
  height: auto;
  transition: filter 0.35s ease;
  cursor: pointer;
}

.mark-l {
  width: 120px !important;
}

.mark:hover {
  filter: drop-shadow(2px 4px 6px black);
}
</style>
