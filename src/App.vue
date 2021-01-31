<template>
  <div class="app">
    <h1>这个是页面内容</h1>
    <visual-editor v-model="jsonData"/>
    <!-- 注释掉上面，去测试testUseModel -->
    <!-- <test-use-model v-model="val"/>val:{{val}} -->
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { VisualEditor } from '@/packages/visual-editor'
  import { TestUseModel } from '@/packages/utils/useModel'

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
        jsonData: {
          container: {
            height: 500,
            width: 800,
          },
          blocks: [
            {top: 100, left: 100},
            {top: 200, left: 200},
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
