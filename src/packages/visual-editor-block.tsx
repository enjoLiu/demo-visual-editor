
import {defineComponent, PropType, computed} from 'vue'
import {VisualEditorBlockData} from "@/packages/visual-editor.utils"

export const VisualEditorBlock = defineComponent({
    props: { // 错误注意区分porps,这个小错找了20分钟bug
        block: {type: Object as PropType<VisualEditorBlockData>, required: true},
    },
    setup(props) {
        const styles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
        }))
        return () => (
            <div class="visual-editor-block" style={styles.value}>
                这是一条block
            </div>
        )
    },
})