export const CONTRIBUTORSTAB = 'CONTRIBUTORSTAB'

const initialState = {
  contributionsWithDetails: [],
  isFetched: false
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CONTRIBUTORSTAB:
      return {
        contributionsWithDetails: action.payload.content,
        isFetched: true
      }
    default:
      return state
  }
}

export default reducer
