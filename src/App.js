import React, { useState, useEffect } from 'react'

const App = () => {
  const [isFetched, setIsFetched] = useState(false)
  const [page, setPage] = useState(1)
  const [repositories, setRepositories] = useState([])
  const [contributors, setContributors] = useState([])
  const repositoriesLink = `https://api.github.com/search/repositories?q=user:angular&per_page=100&page=`
  let contributorsLinks = []

  useEffect(() => {
    fetchRepositories()
  }, [repositories])

  const fetchRepositories = () => {
    fetch(repositoriesLink + page, {
      method: 'GET',
      headers: {
        Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
      }
    })
      .then(setPage(page + 1))
      .then(response => response.json())
      .then(data => {
        if (data.items.length > 1) {
          setRepositories([...repositories, ...data.items])
        } else {
          repositories.map(el => {
            contributorsLinks.push(el.contributors_url)
            return 1
          })
          fetchContributorsLinks()
        }
      })
  }

  const fetchContributorsLinks = () => {
    contributorsLinks.map((el, index) => {
      fetch(el, {
        method: 'GET',
        headers: {
          Authorization: 'token 3874d8733d3b4ad01ee4bf67de4aea66a7735354'
        }
      })
        .then(response => response.text())
        .then(data => setContributors([...contributors, data]))
        .then(() => {
          if (index === contributorsLinks.length - 1) {
            setIsFetched(true)
          }
        })
    })
  }

  const printRepositories = () => {
    let tab = []
    console.log(contributors)
    console.log(contributorsLinks)

    contributors.map((el, index) => {
      tab.push(
        <li key={index}>
          <h2>{index + 1}</h2>
          <h2>{el.login}</h2>
        </li>
      )
    })

    if (tab.length === 0) {
      return (
        <ul>
          <li>
            <h2>Loading....</h2>
          </li>
        </ul>
      )
    }

    return <ul>{tab}</ul>
  }

  return (
    <div className="container">
      <header>
        <h1 className="title">Angular repos</h1>
      </header>

      <main>
        <div>
          {' '}
          {isFetched ? (
            printRepositories()
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

export default App
