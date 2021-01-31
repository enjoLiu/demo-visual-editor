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