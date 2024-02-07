<template>
  <div class="sky-sea" ref="threeRef">
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
  experience.onConfig()
})

onUnmounted(() => {
  experience.onDestory()
})
</script>

<style scoped>
.sky-sea {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
