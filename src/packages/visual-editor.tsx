import { defineComponent, PropType, computed, ref } from 'vue'
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlockData } from '@/packages/visual-editor.utils'
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

        // 获取拖拽组件的引用
        const containerRef = ref({} as HTMLDivElement)

        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))

        // 抽离公用方法，容器内组件选择的取消事件处理
        const methods = {
            clearFocus: (block?: VisualEditorBlockData) => {
                let blocks = dataModel.value.blocks || []
                if (blocks.length === 0) return
                if (!!block) {
                    blocks = blocks.filter(item => item !== block)
                }
                blocks.forEach(block => block.focus = false)
            }
        }

        /** 
         * 用于实现拖拽，使用原生方法
         * 使用下面这种方式，自执行函数的方式可以使暴露出来的方法仅仅是外面需要的。
        */
        const menuDraggier = (() => {
            // 当前拖拽的元素
            let component = null as null | VisualEditorComponent
            const blockHander = {
                // 在拖动目标上触发事件:: 用户开始拖动元素时触发
                dragstart: (e: DragEvent, current: VisualEditorComponent) => {
                    containerRef.value.addEventListener('dragenter', containerHander.dragenter)
                    containerRef.value.addEventListener('dragover', containerHander.dragover)
                    containerRef.value.addEventListener('dragleave', containerHander.dragleave)
                    containerRef.value.addEventListener('drop', containerHander.drop)
                    component = current
                },
                // 在拖动目标上触发事件: 用户完成元素拖动后触发
                dragend: () => {
                    // 结束拖拽，清理监听事件
                    containerRef.value.removeEventListener('dragenter', containerHander.dragenter)
                    containerRef.value.removeEventListener('dragover', containerHander.dragover)
                    containerRef.value.removeEventListener('dragleave', containerHander.dragleave)
                    containerRef.value.removeEventListener('drop', containerHander.drop)
                    component = null
                },
            }
            const containerHander = {
                // 释放目标时触发的事件:: 当被鼠标拖动的对象进入其容器范围内时触发此事件
                dragenter: (e: DragEvent) => {
                    e.dataTransfer!.dropEffect = 'move' // e.dataTransfer!.  设置光标
                },
                // 释放目标时触发的事件: 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
                // 默认情况下,数据/元素不能在其他元素中被拖放。对于drop我们必须防止元素的默认处理
                dragover: (e: DragEvent) => {
                    // e.stopPropagation() // 为什么不用它?
                    e.preventDefault()
                },
                // 释放目标时触发的事件:: 当被鼠标拖动的对象离开其容器范围内时触发此事件
                dragleave: (e: DragEvent) => {
                    e.dataTransfer!.dropEffect = 'none'
                },
                // 释放目标时触发的事件:: 在一个拖动过程中，释放鼠标键时触发此事件
                drop: (e: DragEvent) => {
                    // 放置的时候触发，只有在拖拽进 body下的container下才会触发，即 ref绑定的组件，其他地方放置的时候是不触发的。
                    const blocks = dataModel.value.blocks || []
                    blocks.push(createNewBlock({ component: component!, top: e.offsetY, left: e.offsetX, }))

                    dataModel.value = {
                        ...dataModel.value,
                        blocks,
                    }
                }
            }
            return blockHander
        })()
        /* 
         * 容器内，组件拖拽调整位置
         * 不同于将组件拖拽进画布，使用drag, 画布内用 mouseMove
         * 且需要支持多个同时拖拽
         * 备注：
         * 这里用 onMousedown 不用 click 的原因是因为需要鼠标点击后，直接拖拽，如果用click,就需要先点击一下，在拖拽，不连贯
         * 支持可以多选
         * 支持选择其他画布可以取消选中
         * vue3会自动将监听事件代理到根节点上
        */
        const focusHandler = (() => {
            return {
                // 画布，容器，点击的冒泡处理
                container: {
                    onMousedown: (e: MouseEvent) => {
                        e.stopPropagation() // 防止双击画布直接冒泡到组件上
                        e.preventDefault()
                        methods.clearFocus()
                    }
                },
                // 容器内组件，点击它不需要冒泡到画布
                block: {
                    onMousedown: (e: MouseEvent, block: VisualEditorBlockData) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (e.shiftKey) {
                            block.focus = !block.focus
                        } else {
                            block.focus = true
                            methods.clearFocus(block)
                        }
                    }
                }
            }
        })()

        return () => (
            <div class="visual-editor">
                <div class="visual-editor-menu">
                    {props.config.componentList.map(component => (
                        <div
                            class="visual-editor-menu-item"
                            draggable
                            onDragend={menuDraggier.dragend}
                            onDragstart={(e) => menuDraggier.dragstart(e, component)}
                        >
                            <span class="visual-editor-menu-item-label">{component.label}</span>
                            {component.preview()}
                        </div>
                    ))}
                </div>
                <div class="visual-editor-head">
                    visual-editor-head
                </div>
                <div class="visual-editor-operator">
                    visual-editor-operator
                </div>
                <div class="visual-editor-body">
                    <div class="visual-editor-content">
                        <div
                            class="visual-editor-container"
                            style={containerStyles.value}
                            ref={containerRef} // 通过这里进行绑定
                            {...focusHandler.container} // vue3通过这种方式绑定点击事件，而react需要通过派发的方式
                        >
                            {!!dataModel.value.blocks && (
                                dataModel.value.blocks.map((block, index) => (
                                    <VisualEditorBlock
                                        config={props.config}
                                        block={block}
                                        key={index}
                                        {...{
                                            onMousedown: (e: MouseEvent) => focusHandler.block.onMousedown(e, block)
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        )
    }
})
