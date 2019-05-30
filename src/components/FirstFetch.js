import React from 'react'
import { REPOSITORIESLINK, TOKEN } from '../constants'
import { connect } from 'react-redux'
import { fillContributors } from '../redux/actions'
import App from './App'
import UserProfile from './userProfile/userProfile'
import Repository from './Repository/Repository'

class FetchAngularRepositories extends React.Component {
  state = {
    page: 1,
    repositories: [],
    contributors: [],
    contributorsLinks: [],
    errors: 0,
    contributionsWithDetails: []
  }
  componentDidMount() {
    this.fetchRepositories()
  }

  fetchRepositories = () => {
    fetch(REPOSITORIESLINK + this.state.page, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('I am fetching repos')
        if (data.items.length > 1) {
          this.setState(
            prevState => ({
              repositories: [...prevState.repositories, ...data.items],
              page: this.state.page + 1
            }),
            this.fetchRepositories
          )
        } else if (data.items.length < 100) {
          let tab = []
          this.state.repositories.map(el => {
            tab.push(el.contributors_url)
            return 1
          })
          if (this.state.contributorsLinks !== tab) {
            this.setState({ contributorsLinks: tab }, this.fetchContributorsLinks)
          }
        }
      })
  }

  fetchContributorsLinks = () => {
    this.state.contributorsLinks.map((el, index) => {
      fetch(el, {
        method: 'GET',
        headers: {
          Authorization: TOKEN
        }
      })
        .then(response => {
          console.log('I am fetchingContributorsLinks')
          if (response.statusText === 'OK') {
            return response.json()
          } else {
            return console.log(`${this.state.contributorsLinks[index]} number ${index} is valid`)
          }
        })
        .then(data => {
          if (typeof data !== 'undefined') {
            return this.setState(
              prevState => ({ contributors: [...prevState.contributors, data] }),
              this.allContributors
            )
          } else {
            return this.setState({ errors: this.state.errors + 1 })
          }
        })
      return 1
    })
  }

  allContributors = () => {
    if (
      this.state.contributorsLinks.length ===
      this.state.contributors.length + this.state.errors
    ) {
      let contributorsTab = []
      let checkID = []

      this.state.contributors.map(el => {
        el.map(element => {
          console.log('I am pushing props "repeats"')
          if (checkID.includes(element.id)) {
            let position = checkID.indexOf(element.id)
            contributorsTab[position].repeats++
            return 0
          } else {
            contributorsTab.push(element)
            contributorsTab[contributorsTab.length - 1].repeats = 0
            checkID.push(element.id)
            return 1
          }
        })
        return 1
      })

      contributorsTab.map(el => {
        this.fetchUserUrl(el.url, contributorsTab.length, contributorsTab)
        return 1
      })
    }
  }

  fetchUserUrl = (el, length, contributorsTab) => {
    fetch(el, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('I am fetchingUserUrl ')
        this.setState(
          prevState => ({
            contributionsWithDetails: [...prevState.contributionsWithDetails, data]
          }),
          () => this.allContributorsWithDetails(length, contributorsTab)
        )
      })
  }

  allContributorsWithDetails = (length, contributorsTab) => {
    if (this.state.contributionsWithDetails.length === length) {
      let contributionsWithRepeats = this.state.contributionsWithDetails
      contributorsTab.map((el, index) => {
        console.log('I am pushing details')
        contributionsWithRepeats[index].repeats = el.repeats
        return 1
      })
      // this.newResults(this.state.contributionsWithDetails, false)
      console.log(contributionsWithRepeats)
      this.props.fillContributors(contributionsWithRepeats)
    }
  }

  render() {
    return (
      <>
        {this.props.isFetched ? (
          <App />
        ) : (
          <>
            <h2 style={{ textAlign: 'center', paddingTop: '50px' }}>Loading...</h2>
            <h3>We are fetching all Angular repositories contributors </h3>
            <h3 style={{ paddingBottom: '50px' }}>It can take up to one minute</h3>
          </>
        )}
        {this.props.isUserProfile ? <UserProfile /> : ''}
        {this.props.isRepositoryProfile ? <Repository /> : ''}
      </>
    )
  }
}

const mapStateToProps = state => ({
  contributionsWithDetails: state.contributionsWithDetails,
  isFetched: state.isFetched,
  isUserProfile: state.isUserProfile,
  isRepositoryProfile: state.isRepositoryProfile
})

export default connect(
  mapStateToProps,
  { fillContributors }
)(FetchAngularRepositories)
