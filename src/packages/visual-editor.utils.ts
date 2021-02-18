
// 数据模型，用于实现组价内双向数据绑定
export interface VisualEditorBlockData {
    top: number,
    left: number,
}

export interface VisualEditorModelValue {
    container: {
        width: number,
        height: number,
    },
    blocks?: VisualEditorBlockData[], // ?:的用法，以后看ts注意下，是否必须要有的意思？
}

// 注册组件一个预览内容，一个渲染内容
export interface VisualEditorComponent {
    key: string,
    label: string,
    preview: () =>JSX.Element,
    render: () =>JSX.Element,
}

/*
 左侧需要一系列的元素注册，这里用一个函数实现，每次调用这个函数就注册一个组件
 @componentList 用于在左边列表里按顺序的渲染 
 @componentMap 方便更好的根据name 查找组件
 */ 
export function createVisualEditorConfig() {
    const componentList: VisualEditorComponent[] = []
    const componentMap: Record<string, VisualEditorComponent> = {}

    return {
        componentList,
        componentMap,
        registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
            let comp = { ...component, key }
            // componentList.push(component)
            componentList.push(comp)
            componentMap[key] = comp
        }
    }
}
export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>
