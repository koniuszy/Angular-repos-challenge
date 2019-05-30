import { CONTRIBUTORSTAB } from './reducers/counter'

export const fillContributors = content => {
  console.log(content)
  return {
    type: CONTRIBUTORSTAB,
    payload: {
      content
    }
  }
}
