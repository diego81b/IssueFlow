export enum TodoType {
  TODO = 'TODO',
  FIXME = 'FIXME',
  BUG = 'BUG'
}

export const TODO_TYPE_LABELS = {
  [TodoType.TODO]: 'TODO',
  [TodoType.FIXME]: 'FIX',
  [TodoType.BUG]: 'BUG'
} as const
