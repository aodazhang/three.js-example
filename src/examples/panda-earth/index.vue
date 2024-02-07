<template>
  <div class="panda-earth" ref="threeRef">
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
  /* CSS2DRender、CSS3DRender 挂载的 dom 对象都是双面的，需要隐藏掉背面防止渲染异常 */
  backface-visibility: hidden;
  pointer-events: auto;
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
