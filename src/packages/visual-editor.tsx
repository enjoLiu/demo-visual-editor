import { defineComponent, PropType, computed, ref } from 'vue'
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlockData } from '@/packages/visual-editor.utils'
import { useModel } from '@/packages/utils/useModel'
import { VisualEditorBlock } from '@/packages/visual-editor-block'
import { useVisualCommand } from '@/packages/utils/visual.command'

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
        // 双向绑定，用公用方法引用对象实现，容器中的组件数据
        const dataModel = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val)) // 双向数据绑定

        // 获取拖拽组件的引用，container节点的dom对象的引用 
        const containerRef = ref({} as HTMLDivElement)

        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))
        /* 计算选中与未选中的block数据 */
        const focusData = computed(() => {
            let focus: VisualEditorBlockData[] = []
            let unFocus: VisualEditorBlockData[] = []; // 这里有；不报错
            (dataModel.value.blocks || []).forEach(block => (block.focus ? focus : unFocus).push(block))
            return {
                focus,    // 此时选中数据
                unFocus,  // 此时未选中数据
            }
        })

        /* 对外暴露的一些方法：抽离公用方法，容器内组件选择的取消事件处理 */
        const methods = {
            clearFocus: (block?: VisualEditorBlockData) => {
                let blocks = dataModel.value.blocks || []
                if (blocks.length === 0) return
                if (!!block) {
                    blocks = blocks.filter(item => item !== block)
                }
                blocks.forEach(block => block.focus = false)
            },
            updateBlocks: (blocks: VisualEditorBlockData[]) => {
                dataModel.value = {
                    ...dataModel.value,
                    blocks,
                }
            }
        }

        /** 
         * 用于实现拖拽，使用原生方法
         * 处理从菜单拖拽组件到容器的相关动作
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
                    const blocks = [...dataModel.value.blocks || []]
                    blocks.push(createNewBlock({ component: component!, top: e.offsetY, left: e.offsetX, }))

                    methods.updateBlocks(blocks)
                    // dataModel.value = {
                    //     ...dataModel.value,
                    //     blocks,
                    // }
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
                        /* 点画布清空选中 */
                        methods.clearFocus()
                    }
                },
                // 容器内组件，点击它不需要冒泡到画布
                block: {
                    onMousedown: (e: MouseEvent, block: VisualEditorBlockData) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (e.shiftKey) {
                            /* 
                            如果按住shif键，如果此时没有选中的block，则选中，否则选中状态取反
                            （最后一个不会反选），实际是为了实现，按住shift键，选中一个，则实现水平和垂直移动
                            后续补充这个，还要画水平线
                             */
                            if (focusData.value.focus.length <= 1) {
                                block.focus = true
                            } else {
                                block.focus = !block.focus
                            }
                        } else {
                            /* 
                            分情况，如果点中的组件是未选中状态，则清空点击，如果是已经选中的，则不要清空，下一步很可能走move
                            这是实现 多选后移动的关键，如果判断是多选状态，点下后不要情况选中，这样就可以实现多选移动
                            */
                            if (!block.focus) {
                                block.focus = true
                                methods.clearFocus(block)
                            }
                        }
                        blockDraggier.mousedown(e)
                    }
                }
            }
        })()

        /* 
         * 选中容器中的组件后，移动所有选中的组件
         */
        const blockDraggier = (() => {
            // 拖拽开始的鼠标位置
            let dragState = {
                startX: 0,
                startY: 0,
                startPos: [] as { left: number, top: number }[],
            }
            const mousedown = (e: MouseEvent) => {
                dragState = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
                }
                document.addEventListener('mousemove', mousemove)
                document.addEventListener('mouseup', mouseup)
            }

            const mousemove = (e: MouseEvent) => {
                const durX = e.clientX - dragState.startX
                const durY = e.clientY - dragState.startY
                focusData.value.focus.forEach((block, index) => {
                    block.top = dragState.startPos[index].top + durY
                    block.left = dragState.startPos[index].left + durX
                })
            }

            const mouseup = () => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
            }

            return { mousedown }
        })()

        // 顶部操作按钮
        const commander = useVisualCommand({
            focusData,
            updateBlocks: methods.updateBlocks,
            dataModel,
        })

        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: commander.undo, tip: 'ctrl+z' },
            { label: '重做', icon: 'icon-forward', handler: commander.redo, tip: 'ctrl+y, ctrl+shift+z' },
            { label: '删除', icon: 'icon-delete', handler: () => commander.delete(), tip: 'ctrl+d, backspace, delete' },
        ]

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
                    {buttons.map((btn, index) => (
                        <div key={index} class="visual-editor-head-button" onClick={btn.handler}>
                            <i class={`iconfont ${btn.icon}`} />
                            <span>{btn.label}</span>
                        </div>
                    ))}
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
