export const CONTRIBUTORSTAB = 'CONTRIBUTORSTAB'
export const GOTOUSERPROFILE = 'GOTOUSERPROFILE'
export const GOHOME = 'GOHOME'
export const GOREPO = 'GOREPO'

const initialState = {
  contributionsWithDetails: [],
  isFetched: false,
  isUserProfile: false,
  userProfileUrl: '',
  isRepositoryProfile: false,
  RepositoryUrl: '',
  isLoader: true
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CONTRIBUTORSTAB:
      return {
        ...state,
        contributionsWithDetails: action.payload.content,
        isFetched: true,
        isLoader: false
      }
    case GOTOUSERPROFILE:
      return {
        ...state,
        userProfileUrl: action.payload.url,
        isFetched: false,
        isUserProfile: true,
        isRepositoryProfile: false
      }
    case GOHOME:
      return {
        ...state,
        isFetched: true,
        isUserProfile: false,
        isRepositoryProfile: false
      }
    case GOREPO:
      return {
        ...state,
        RepositoryUrl: action.payload.url,
        isFetched: false,
        isUserProfile: false,
        isRepositoryProfile: true
      }
    default:
      return state
  }
}

export default reducer
