<template>
  <div class="app">
    <h1>这个是页面内容</h1>
    <visual-editor v-model="jsonData" :config="visualConfig"/>
    <!-- 注释掉上面，去测试testUseModel -->
    <!-- <test-use-model v-model="val"/>val:{{val}} -->
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { VisualEditor } from '@/packages/visual-editor'
  import { TestUseModel } from '@/packages/utils/useModel'
  import { visualConfig } from '@/visual.config'

  export default defineComponent({
    name: 'App',
    components: {
      VisualEditor,
      // TestUseModel,
    },
    // 用于测试testUseModel
    data() {
      // return {
      //   val: '',
      // }
      return {
        visualConfig,
        jsonData: {
          container: {
            height: 500,
            width: 800,
          },
          blocks: [
            {top: 200, left: 100, componentKey: 'text'},
            {top: 100, left: 100, componentKey: 'button'},
            {top: 200, left: 200, componentKey: 'input'},
          ]
        }
      }
    },
  })
</script>

<style lang="scss">
  html,body {
    margin: 0;
    padding: 0;
  }
</style>
