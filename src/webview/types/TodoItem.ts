import { TodoType } from './TodoType'

export interface TodoItem {
  id: string
  file: string
  line: number
  content: string
  type: TodoType
  description: string
  selected: boolean
}
