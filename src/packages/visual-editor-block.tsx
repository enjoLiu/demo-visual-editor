import { defineComponent, PropType, computed, onMounted, ref } from 'vue'
import { VisualEditorBlockData, VisualEditorConfig } from "@/packages/visual-editor.utils"

export const VisualEditorBlock = defineComponent({
    props: { // 错误注意区分porps,这个小错找了20分钟bug
        block: { type: Object as PropType<VisualEditorBlockData>, required: true },
        config: { type: Object as PropType<VisualEditorConfig>, required: true },
    },
    setup(props) {
        // 引用对象，如果确定可以拿到实际的元素
        const el = ref({} as HTMLDivElement)

        const styles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
        }))

        onMounted(() => {
            // moented的时候判断是否需要自动调整位置，使放置的瞬间自动居中于鼠标
            const block = props.block
            if (block.adjustpositon) {
                const { offsetWidth, offsetHeight } = el.value
                block.left = block.left - offsetWidth/2
                block.top = block.top - offsetHeight/2
                block.adjustpositon = false
            }
        })
        return () => {
            const component = props.config.componentMap[props.block.componentKey]
            const Render = component.render()
            return (
                <div class="visual-editor-block" style={styles.value} ref={el}>
                    {Render}
                </div>
            )
        }
    },
})