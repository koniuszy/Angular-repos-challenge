import React from 'react'

import UserProfile from './userProfile'
import 'react-awesome-button/dist/styles.css'

import DropDownButton from 'react-bootstrap/DropdownButton'
import DropDown from 'react-bootstrap/Dropdown'
import _ from 'lodash'
import { AwesomeButton } from 'react-awesome-button'
import { connect } from 'react-redux'
// import { counter } from '../redux/actions'
import { GISTS, FOLLOWERS, REPOSITORIES, CONTRIBUTIONS } from '../constants'
import FetchRepositories from './fetch'

class App extends React.Component {
  state = {
    results: [],
    isFiltering: false,
    isProfile: false,
    inputFrom: '',
    inputTo: ''
  }

  componentDidMount() {}

  newResults = (tab, filter) => {
    this.setState({ isFetched: true })
    let filteredBy = filter
    if (filter === CONTRIBUTIONS) {
      filteredBy = 'amount of contributions to all Angular repositories'
    }
    if (filter === false) {
      filteredBy = 'nothing right now'
    }
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
          <h3
            className="pointer"
            onClick={() => {
              this.setState({ isFiltering: false, isFetched: false, isProfile: el.url })
            }}
          >
            visit profile
          </h3>
        </li>
      )
      return 1
    })
    results.push(
      <li key="filtering">
        <h3>The list is filtered by {filteredBy} </h3>
      </li>
    )
    this.setState({
      results: results
    })
    if (filter) {
      this.setState({
        isFiltering: filter
      })
    }
  }

  sort = filter => {
    let tab = _.sortBy(this.state.contributionsWithDetails, o => o[filter]).reverse()
    this.newResults(tab, filter)
  }

  ascending = desc => {
    const filter = this.state.isFiltering
    let users = this.state.contributionsWithDetails
    users = this.state.contributionsWithDetails.filter(el => this.filterBy(el[filter]))
    users = _.sortBy(users, o => o[filter])
    if (desc) {
      users.reverse()
    }
    this.newResults(users, filter)
  }

  filterBy = el => {
    const from = this.state.inputFrom
    const to = this.state.inputTo
    if (from === '' && to === '') {
      return true
    } else {
      if (from === '') {
        return el <= to
      } else if (to === '') {
        return el >= from
      } else {
        return el >= from && el <= to
      }
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    let filteredResults = this.state.contributionsWithDetails.filter(el =>
      this.filterBy(el[this.state.isFiltering])
    )
    this.newResults(filteredResults, this.state.isFiltering)
  }

  comeBack = () => {
    this.setState({
      isFetched: true,
      isProfile: false
    })
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1 className="title">Frontend developer challenge</h1>
          <FetchRepositories />
          {this.props.isFetched
            ? this.newResults(this.props.contributionsWithDetails, false)
            : console.log(3)}
          {this.state.isFetched ? (
            <DropDownButton variant="secondary" id="dropdown-basic-button" title="Filter">
              <DropDown.Item disabled={!this.state.isFetched} onClick={() => this.sort(GISTS)}>
                gist
              </DropDown.Item>
              <DropDown.Item disabled={!this.state.isFetched} onClick={() => this.sort(FOLLOWERS)}>
                followers
              </DropDown.Item>
              <DropDown.Item
                disabled={!this.state.isFetched}
                onClick={() => this.sort(REPOSITORIES)}
              >
                public repos
              </DropDown.Item>
              <DropDown.Item
                disabled={!this.state.isFetched}
                onClick={() => this.sort(CONTRIBUTIONS)}
              >
                contributions to all Angular repositories
              </DropDown.Item>
            </DropDownButton>
          ) : (
            ''
          )}

          {this.state.isFiltering ? (
            <div className="inputs">
              <form onSubmit={this.handleSubmit}>
                from
                <input
                  min={0}
                  type="number"
                  name="inputFrom"
                  value={this.state.inputFrom}
                  onChange={this.handleChange}
                />
                to
                <input
                  min={1}
                  type="number"
                  name="inputTo"
                  value={this.state.inputTo}
                  onChange={this.handleChange}
                />
                <input className="submit" type="submit" />
              </form>
              <AwesomeButton
                type="primary"
                size="medium"
                action={() => this.ascending(false)}
                className="ascending"
              >
                Sort ascending
              </AwesomeButton>
              <AwesomeButton
                type="primary"
                size="medium"
                action={() => this.ascending(true)}
                className="descending"
              >
                Sort descending
              </AwesomeButton>
              <AwesomeButton
                type="primary"
                action={() => {
                  this.setState({ isFiltering: false })
                  this.newResults(this.state.contributionsWithDetails, false)
                }}
                size="medium"
              >
                Clear
              </AwesomeButton>
            </div>
          ) : (
            ''
          )}
        </header>

        <main>
          <div>
            {this.state.isFetched ? (
              <>
                <h2 className="title"> {this.state.results.length - 1} users were found</h2>
                <h2>{this.state.results[this.state.results.length - 1]} </h2>
                <ul>{this.state.results}</ul>
              </>
            ) : this.state.isProfile ? (
              <UserProfile handleClick={this.comeBack} url={this.state.isProfile} />
            ) : (
              <ul>
                <li>
                  <h2>Loading....</h2>
                  <h3>It can take up to one minute</h3>
                </li>
              </ul>
            )}
          </div>
        </main>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  contributionsWithDetails: state.contributionsWithDetails,
  isFetched: state.isFetched
})

export default connect(mapStateToProps)(App)
