import React from 'react'
import UserProfile from '../userProfile/userProfile'
import { TOKEN } from '../../constants'

import { connect } from 'react-redux'
import { goToUserProfile, goToHomePage } from '../../redux/actions'

class Profile extends React.Component {
  state = {
    repository: false,
    isRepository: true,
    url: [],
    contributors: [],
    contributorsWithDetails: [],
    page: 1
  }

  componentDidMount() {
    this.fetchRepository()
  }

  fetchRepository = () => {
    let link = this.props.url
    fetch(link, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data => this.setState({ repository: data }, this.fetchContributors))
  }

  fetchContributors = () => {
    fetch(`${this.state.repository.contributors_url}?per_page=100&page=${this.state.page}`, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data =>
        this.setState(
          prevState => ({
            contributors: [...prevState.contributors, ...data],
            page: this.state.page + 1
          }),
          () => {
            if (data.length === 100) {
              this.fetchContributors()
            } else {
              this.fetchContributorsWithDetails()
            }
          }
        )
      )
  }

  fetchContributorsWithDetails = () => {
    let contributors = this.state.contributors

    contributors.map(el => {
      fetch(el.url, {
        method: 'GET',
        headers: {
          Authorization: TOKEN
        }
      })
        .then(response => response.json())
        .then(data =>
          this.setState(prevState => ({
            contributorsWithDetails: [...prevState.contributorsWithDetails, data]
          }))
        )
      return 1
    })
  }

  getRepository = () => {
    let el = this.state.repository
    let contributors = this.state.contributorsWithDetails
    if (contributors.length === 0) {
      contributors = false
    }
    return this.state.repository ? (
      <ul key={'repository'}>
        <li key={'repo'}>
          <h2>repository: {el.full_name}</h2>
          <br />
          <h3>owner: {el.owner.login}</h3>
          <h3>{el.language}</h3>
          <h3>created at {el.created_at}</h3>
          <h3 className="pointer" onClick={goToHomePage}>
            Click here to come back!
          </h3>
        </li>
        {contributors ? this.getContributors() : <h3>Loading...</h3>}
      </ul>
    ) : (
      ''
    )
  }

  getContributors = () => {
    let tab = this.state.contributorsWithDetails
    let results = []

    tab.map((el, index) => {
      results.push(
        <li key={index}>
          <h2>{index + 1}</h2>
          <h2>{el.login}</h2>
          <h2>public gists: {el.public_gists}</h2>
          <h2>public repositories: {el.public_repos}</h2>
          <h2>followers: {el.followers}</h2>
          <h3 className="pointer" onClick={this.props.goToUserProfile}>
            visit profile
          </h3>
        </li>
      )
      return 1
    })

    return (
      <ul key={'contributors'}>
        <h2>{tab.length} contributors:</h2>
        <br />
        <br />
        {results}
      </ul>
    )
  }

  render() {
    return this.state.isRepository ? this.getRepository() : <UserProfile url={this.state.url} />
  }
}

const mapStateToProps = state => ({
  url: state.RepositoryUrl
})

export default connect(
  mapStateToProps,
  { goToUserProfile }
)(Profile)
