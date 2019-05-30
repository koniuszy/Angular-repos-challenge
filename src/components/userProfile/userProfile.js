import React from 'react'
import RepositoryProfile from '../Repository/Repository'
import { TOKEN } from '../../constants'
import { connect } from 'react-redux'
import { goToHomePage, goToRepository } from '../../redux/actions'

class Profile extends React.Component {
  state = {
    isUserProfile: true,
    profile: [],
    repositories: [],
    page: 1,
    url: []
  }

  componentDidMount() {
    this.fetchProfile()
  }

  fetchProfile = () => {
    fetch(this.props.url, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data => this.setState({ profile: data }, this.fetchRepositories))
  }

  fetchRepositories = () => {
    let link = this.state.profile.repos_url
    fetch(`${link}?per_page=100&page=${this.state.page}`, {
      method: 'GET',
      headers: {
        Authorization: TOKEN
      }
    })
      .then(response => response.json())
      .then(data =>
        this.setState(
          prevState => ({
            repositories: [...prevState.repositories, ...data],
            page: this.state.page + 1
          }),
          () => {
            if (data.length === 100) {
              this.fetchRepositories()
            }
          }
        )
      )
  }

  realName = () => {
    let name = this.state.profile.name
    if (typeof name === undefined || name === null) {
      name = '(tbh I do not have a name)'
    }
    return name
  }

  getRepositories = () => {
    if (this.state.repositories.length !== 0) {
      let tab = this.state.repositories
      let results = []

      tab.map((el, index) => {
        results.push(
          <li key={index}>
            <h2>{index + 1}</h2>
            <h2>{el.name}</h2>
            <h3>{el.language}</h3>
            <h3>{el.description}</h3>
            <h3>created at {el.created_at}</h3>
            <h4
              className="pointer"
              onClick={() => {
                this.props.goToRepository(el.url)
              }}
            >
              visit repository
            </h4>
          </li>
        )
        return 1
      })

      return (
        <>
          <h2>{this.state.repositories.length} repositories:</h2>
          <ul>{results}</ul>
        </>
      )
    }
  }

  publicRepositories = () => {
    if (this.state.profile.public_repos > 0) {
      return (
        <>
          <h2>
            I have contributed to {this.state.profile.public_repos} repositories, you are more than
            welcome to see them!
          </h2>
          <h2>
            Do not hesitate to click on your chosen repository to see other contributors and their
            repositories.
          </h2>
        </>
      )
    }

    return (
      <>
        <h2> Unfortunately I didn't contributed to any repositories. </h2>
        <h2> Remember to use filter to find users with repositories </h2>
      </>
    )
  }

  render() {
    return this.state.isUserProfile ? (
      <div className="userContainer">
        <div className="imgContainer">
          <img id="GitPict" alt="img" src={this.state.profile.avatar_url} />
        </div>
        <h2 className="margin">Welcome to {this.state.profile.login}'s profile!</h2>
        <br />
        <br />
        <br />
        <h2>My real name is {this.realName()}.</h2>
        <br />
        <h2>I am on Github since {this.state.profile.created_at}.</h2>
        <br />
        <h2>
          I have {this.state.profile.followers} followers and I am following{' '}
          {this.state.profile.following} users!
        </h2>
        <br />
        {this.publicRepositories()}
        <br />
        <h3 onClick={this.props.goToHomePage} className="pointer">
          Click here to come back!
        </h3>
        <br />
        <br />
        {this.getRepositories()}
      </div>
    ) : (
      <RepositoryProfile url={this.state.url} />
    )
  }
}

const mapStateToProps = state => ({
  url: state.userProfileUrl
})

export default connect(
  mapStateToProps,
  { goToHomePage, goToRepository }
)(Profile)
