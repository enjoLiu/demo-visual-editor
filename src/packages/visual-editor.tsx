import { defineComponent, PropType, computed } from 'vue'
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig } from '@/packages/visual-editor.utils'
import { useModel } from '@/packages/utils/useModel'
import { VisualEditorBlock } from '@/packages/visual-editor-block'

export const VisualEditor = defineComponent({
    props: {
        // body中的数据源
        modelValue: { type: Object as PropType<VisualEditorModelValue>, required: true },
        // config中的数据源
        config: { type: Object as PropType<VisualEditorConfig>, required: true }
    },
    // 派发事件类型
    emits: {
        'update:modelValue': (val?: VisualEditorModelValue) => true,
    },
    setup(props, ctx) {
        // 双向绑定，用公用方法引用对象实现
        const dataModel = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val)) // 双向数据绑定
        console.log(dataModel, 'dataModel')
        console.log(props.config, 'config')

        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))

        return () => (
            <div class="visual-editor">
                <div class="visual-editor-menu">
                    {props.config.componentList.map(component => <div class="visual-editor-menu-item">
                        <span class="visual-editor-menu-item-label">{component.label}</span>
                        {component.preview()}
                    </div>)}
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
                                dataModel.value.blocks.map((block, index) => (
                                    <VisualEditorBlock block={block} key={index} />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        )
    }
})
