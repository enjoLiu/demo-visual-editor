/* 
    命令队列的实现，用于快捷键回撤等
    命令队列里记录undo 和redo，点击回撤就执行，且current + - 1
*/
import { reactive } from 'vue'

export interface CommandExecute {
    undo?: () => void,
    redo: () => void,
}
export interface Command {
    name: string, // 唯一命令表示
    keyboard?: string | string[], // 快捷键
    execute: (...args: any[]) => CommandExecute, // 命令被执行的时候所做的内容
    followQueue?: boolean, // 命令执行完成之后，是否需要将命令执行得到的 undo redo 存入命令队列
}

export function useCommander() {
    const state = reactive({
        current: -1,
        queue: [] as CommandExecute[],
        commands: {} as Record<string, (...args: any[]) => void>
    })

    const registry = (command: Command) => {
        state.commands[command.name] = (...args) => {
            const { undo, redo } = command.execute(...args)
            redo()
            if (command.followQueue === false) {
                return 
            }

            // 一旦撤销之后，再重新操作，撤销前的操作不可再撤销
            let { queue, current } = state
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1)
                state.queue = queue
            }
            queue.push({ undo, redo })
            state.current = current + 1
        }
    }

    // 注册默认的两个命令
    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        followQueue: false,
        execute: () => {
            // 这里一般是定义闭包函数需要的变量等
            return {
                redo: () => {
                    // 撤销,注意一点，
                    if (state.current === -1) return
                    const queueItem = state.queue[state.current]
                    if (!!queueItem) {
                        !!queueItem.undo && queueItem.undo()
                        state.current--
                    }
                },
            }
        }
    })

    registry({
        name: 'redo',
        keyboard: [
            'ctrl+y',
            'ctrl+shift+z',
        ],
        followQueue: false,
        execute: () => {
            return {
                redo: () => {
                    const queueItem = state.queue[state.current + 1]
                    if (!!queueItem) {
                        queueItem.redo()
                        state.current++                        
                    }
                },

            }
        }
    })

    return {
        state,
        registry,
    }
}