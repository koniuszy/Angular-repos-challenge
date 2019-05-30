import { CONTRIBUTORSTAB } from './reducers/counter'

export const fillContributors = content => {
  return {
    type: CONTRIBUTORSTAB,
    payload: {
      content
    }
  }
}
