import React from 'react'
import DropDownButton from 'react-bootstrap/DropdownButton'
import DropDown from 'react-bootstrap/Dropdown'
import _ from 'lodash'
class App extends React.Component {
  constructor(props) {
    super(props)
    this.fromRef = React.createRef()
    this.toRef = React.createRef()
  }

  state = {
    isFetched: false,
    page: 1,
    repositories: [],
    contributors: [],
    contributorsLinks: [],
    errors: 0,
    contributorsWithoutRepeats: [],
    contributionsWithDetails: [],
    results: [],
    isFiltering: false
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
        Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
      }
    })
      .then(response => response.json())
      .then(data =>
        this.setState(
          prevState => ({
            contributionsWithDetails: [...prevState.contributionsWithDetails, data]
          }),
          () => this.allContributorsWithDetails(length, contributorsTab)
        )
      )
  }

  allContributorsWithDetails = (length, contributorsTab) => {
    if (this.state.contributionsWithDetails.length === length) {
      let contributionsWithRepeats = this.state.contributionsWithDetails
      contributorsTab.map((el, index) => {
        contributionsWithRepeats[index].repeats = el.repeats
        return 1
      })

      this.setState(
        {
          contributionsWithDetails: contributionsWithRepeats,
          isFetched: true
        },
        () => this.newResults(this.state.contributionsWithDetails, 'none')
      )
    }
  }

  filterGists = () => {
    let tab = _.sortBy(this.state.contributionsWithDetails, function(o) {
      return o.public_gists
    }).reverse()
    this.newResults(tab, 'gists')
  }

  filterFollowers = () => {
    let tab = _.sortBy(this.state.contributionsWithDetails, function(o) {
      return o.followers
    }).reverse()
    this.newResults(tab, 'followers')
  }

  filterRepositories = () => {
    let tab = _.sortBy(this.state.contributionsWithDetails, function(o) {
      return o.public_repos
    }).reverse()
    this.newResults(tab, 'repositories')
  }

  filterContributions = () => {
    let tab = _.sortBy(this.state.contributionsWithDetails, function(o) {
      return o.repeats
    }).reverse()
    this.newResults(tab, 'contributions')
  }

  newResults = (tab, filter) => {
    let results = []
    tab.map((el, index) => {
      results.push(
        <li key={index}>
          <h2>{index + 1}</h2>
          <h2>{el.login}</h2>
          <h2>public gists: {el.public_gists}</h2>
          <h2>public repositories: {el.public_repos}</h2>
          <h2>followers: {el.followers}</h2>
          <h2>repositories in Angular: {el.repeats + 1}</h2>
        </li>
      )
      return 1
    })
    results.push(
      <li key="filtering">
        <h3>The list is filtered by {filter} </h3>
      </li>
    )

    this.setState({
      results: results
    })

    if (filter !== 'none') {
      this.setState({
        isFiltering: filter
      })
    }

    this.clearInputs()
  }

  ascending = () => {
    const filter = this.state.isFiltering
    let users = this.state.contributionsWithDetails
    const min = this.fromRef.current.value
    const max = this.toRef.current.value

    if (filter === 'public_gists') {
      users = this.state.contributionsWithDetails.filter(el => this.filterBy(el.public_gists))
    }

    _.sortBy(users, function(o) {
      return o.repeats
    })

    this.newResults(users, filter)
  }

  descending = () => {}

  filterInput = () => {
    if (this.state.isFiltering) {
      return (
        <>
          <div className="inputs">
            <form onSubmit={this.handleSubmit}>
              from <input ref={this.fromRef} min={0} type="number" />
              to <input ref={this.toRef} min={1} type="number" />
              <input type="submit" />
              <button onClick={this.ascending} className="sort">
                Sort ascending{' '}
              </button>
              <button onClick={this.descending} className="sort">
                Sort descending{' '}
              </button>
            </form>
          </div>
          <button
            onClick={() => {
              this.setState({ isFiltering: false })
              this.newResults(this.state.contributionsWithDetails, 'none')
            }}
            className="x"
          >
            X
          </button>
        </>
      )
    }
  }

  clearInputs = () => {
    this.toRef.current.value = ''
    this.fromRef.current.value = ''
  }

  filterBy = el => {
    if (this.fromRef.current.value === '' && this.toRef.current.value === '') {
      return true
    } else {
      if (this.fromRef.current.value === '') {
        return el <= this.toRef.current.value
      } else {
        return el >= this.fromRef.current.value && el <= this.toRef.current.value
      }
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    let switcher = this.state.isFiltering
    let filteredResults
    switch (switcher) {
      case 'gists':
        filteredResults = this.state.contributionsWithDetails.filter(el =>
          this.filterBy(el.public_gists)
        )
        this.newResults(filteredResults, switcher)
        break

      case 'followers':
        filteredResults = this.state.contributionsWithDetails.filter(el =>
          this.filterBy(el.followers)
        )
        this.newResults(filteredResults, switcher)
        break

      case 'repositories':
        filteredResults = this.state.contributionsWithDetails.filter(el =>
          this.filterBy(el.public_repos)
        )
        this.newResults(filteredResults, switcher)
        break

      case 'contributions':
        filteredResults = this.state.contributionsWithDetails.filter(el =>
          this.filterBy(el.repeats)
        )
        this.newResults(filteredResults, switcher)
        break

      default:
        break
    }
  }

  printRepositories = () => {
    return (
      <>
        <h2 className="title"> {this.state.results.length - 1} users were found</h2>
        <ul>{this.state.results}</ul>
      </>
    )
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1 className="title">Angular repos</h1>
          <DropDownButton variant="secondary" id="dropdown-basic-button" title="Filter">
            <DropDown.Item disabled={!this.state.isFetched} onClick={this.filterGists}>
              gist
            </DropDown.Item>
            <DropDown.Item disabled={!this.state.isFetched} onClick={this.filterFollowers}>
              followers
            </DropDown.Item>
            <DropDown.Item disabled={!this.state.isFetched} onClick={this.filterRepositories}>
              public repos
            </DropDown.Item>
            <DropDown.Item disabled={!this.state.isFetched} onClick={this.filterContributions}>
              contributions to all Angular repositories
            </DropDown.Item>
          </DropDownButton>
          {this.filterInput()}
        </header>

        <main>
          <div>
            {this.state.isFetched ? (
              this.printRepositories()
            ) : (
              <ul>
                <li>
                  <h2>Loading....</h2>
                  <h3>It can takes one minute</h3>
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
