<template>
  <div class="app">
    <h1>这个是页面内容</h1>
    <visual-editor/>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { VisualEditor } from '@/packages/visual-editor'

  export default defineComponent({
    name: 'App',
    components: {
      VisualEditor,
    }
  })
</script>

<style lang="scss">
  html,body {
    margin: 0;
    padding: 0;
  }
</style>
