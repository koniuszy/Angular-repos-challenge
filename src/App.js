import React from 'react'
import DropDownButton from 'react-bootstrap/DropdownButton'
import DropDown from 'react-bootstrap/Dropdown'
import _ from 'lodash'
class App extends React.Component {
  state = {
    isFetched: false,
    page: 1,
    repositories: [],
    contributors: [],
    contributorsLinks: [],
    errors: 0,
    contributorsWithoutRepeats: [],
    contributionsWithDetails: [],
    sortedByGists: false
  }

  REPOSITORIESLINK = `https://api.github.com/search/repositories?q=user:angular&per_page=100&page=`

  componentDidMount() {
    this.fetchRepositories()
  }

  fetchRepositories = () => {
    fetch(this.REPOSITORIESLINK + this.state.page, {
      method: 'GET',
      headers: {
        Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
      }
    })
      .then(this.setState({ page: this.state.page + 1 }))
      .then(response => response.json())
      .then(data => {
        if (data.items.length > 1) {
          this.setState(
            prevState => ({ repositories: [...prevState.repositories, ...data.items] }),
            this.fetchRepositories
          )
        }
        if (data.items.length < 100) {
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
          Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
        }
      })
        .then(response => {
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
      let results = []
      let contributorsTab = []
      let checkID = []

      this.state.contributors.map(el => {
        el.map(element => {
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

      this.setState({
        contributorsWithoutRepeats: results,
        isFetched: true
      })

      contributorsTab.map((el, index) => {
        this.fetchUserUrl(el.url)
        results.push(
          <li key={index}>
            <h2>{index + 1}</h2>
            <h2>{el.login}</h2>
          </li>
        )
        return 1
      })
    }
  }

  fetchUserUrl = el => {
    fetch(el, {
      method: 'GET',
      headers: {
        Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
      }
    })
      .then(response => response.json())
      .then(data =>
        this.setState(prevState => ({
          contributionsWithDetails: [...prevState.contributionsWithDetails, data]
        }))
      )
  }

  printRepositories = () => {
    if (this.state.sortedByGists) {
      return this.state.sortedByGists
    } else {
      return (
        <>
          <h2 className="title"> {this.state.contributorsWithoutRepeats.length} users found</h2>{' '}
          <ul>{this.state.contributorsWithoutRepeats}</ul>
        </>
      )
    }
  }

  filterGists = () => {
    let results = []
    let tab = _.sortBy(this.state.contributionsWithDetails, function(o) {
      return o.public_gists
    }).reverse()

    tab.map((element, index) => {
      results.push(
        <li key={index}>
          <h2>{index + 1}</h2>
          <h2>{element.login}</h2>
        </li>
      )
      return 1
    })

    this.setState({
      sortedByGists: [<ul key="gists"> {results} </ul>]
    })
  }
  filterFollowers = () => {}
  filterRepositories = () => {}
  filterContributions = () => {}

  render() {
    return (
      <div className="container">
        <header>
          <h1 className="title">Angular repos</h1>
          <DropDownButton variant="secondary" id="dropdown-basic-button" title="Filter">
            <DropDown.Item onClick={this.filterGists}>gist</DropDown.Item>
            <DropDown.Item onClick={this.filterFollowers}>followers</DropDown.Item>
            <DropDown.Item onClick={this.filterRepositories}>public repos</DropDown.Item>
            <DropDown.Item onClick={this.filterContributions}>
              contributions to all Angular repositories
            </DropDown.Item>
          </DropDownButton>
        </header>

        <main>
          <div>
            {this.state.isFetched ? (
              this.printRepositories()
            ) : (
              <ul>
                <li>
                  <h2>Loading....</h2>
                </li>
              </ul>
            )}
          </div>
        </main>
      </div>
    )
  }
}

export default App
