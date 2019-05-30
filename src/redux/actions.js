import { CONTRIBUTORSTAB, GOTOUSERPROFILE, GOHOME, GOREPO } from './reducers/counter'

export const fillContributors = content => {
  return {
    type: CONTRIBUTORSTAB,
    payload: {
      content
    }
  }
}

export const goToUserProfile = url => {
  return {
    type: GOTOUSERPROFILE,
    payload: {
      url
    }
  }
}

export const goToHomePage = () => ({
  type: GOHOME
})

export const goToRepository = url => ({
  type: GOREPO,
  payload: {
    url
  }
})
