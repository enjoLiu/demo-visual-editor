import { defineComponent, PropType, computed } from 'vue'
import './visual-editor.scss'
import { VisualEditorModelValue } from '@/packages/visual-editor.utils'
import { useModel } from '@/packages/utils/useModel'
import { VisualEditorBlock } from '@/packages/visual-editor-block'

export const VisualEditor = defineComponent({
    props: {
        modelValue: { type: Object as PropType<VisualEditorModelValue>, required: true}
    },
    // 派发事件类型
    emits: {
        'update:modelValue': (val?: VisualEditorModelValue) => true,
    },
    setup(props, ctx) {
        // 双向绑定，用公用方法引用对象实现
        const dataModel = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val))
        console.log(dataModel, 'dataModel')
        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))

        return () => (
            <div class="visual-editor">
                <div class="visual-editor-menu">
                visual-editor-menu
                </div>
                <div class="visual-editor-head">
                visual-editor-head
                </div>
                <div class="visual-editor-operator">
                visual-editor-operator
                </div>
                <div class="visual-editor-body">
                    <div class="visual-editor-content">
                        <div class="visual-editor-container" style={containerStyles.value}>
                            {!!dataModel.value.blocks && (
                                dataModel.value.blocks.map((block,index) => (
                                    <VisualEditorBlock block={block} key={index}/>
                                ))
                            )}
                        </div>
                    </div>
                
                </div>
            </div>
        )
    }
})
