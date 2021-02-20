import { useCommander } from '@/packages/plugins/command.plugin';
import { VisualEditorBlockData, VisualEditorModelValue } from '../visual-editor.utils';

export function useVisualCommand(
    {
        focusData,
        updateBlocks,
        dataModel,
    }: {
            focusData: {
                value: { focus: VisualEditorBlockData[], unFocus: VisualEditorBlockData[] }
            },
            updateBlocks: (blocks: VisualEditorBlockData[]) => void,
            dataModel: { value: VisualEditorModelValue }
        }
) {
    const commander = useCommander()

    commander.registry({
        name: 'delete',
        keyboard: [
            'backspace',
            'delete',
            'ctrl+d',
        ],
        execute: () => {
            let data = {
                before: dataModel.value.blocks || [],
                after: focusData.value.unFocus,
            }
            return {
                redo: () => {
                    console.log('重做删除')
                    updateBlocks(data.after)
                },
                undo: () => {
                    console.log('撤销删除')
                    updateBlocks(data.before)
                },
                
            }
        }
    })

    // 返回函数的作用是为了规范命名
    return {
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
        delete: () => commander.state.commands.delete(),
    }
}