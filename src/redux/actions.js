import { CONTRIBUTORSTAB } from './reducers/counter'

export const fillContributors = content => ({
  type: CONTRIBUTORSTAB,
  payload: {
    content
  }
})
