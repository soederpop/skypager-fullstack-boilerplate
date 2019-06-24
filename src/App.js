import React, { Component } from 'react'
import types from 'prop-types'
import { Switch, BrowserRouter, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

export default class App extends Component {
  static propTypes = {
    runtime: types.object,
  }

  static childContextTypes = {
    runtime: types.object
  }

  getChildContext() {
    return {
      runtime: this.props.runtime
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="*" component={HomePage} />
        </Switch>
      </BrowserRouter>
    )
  }
}
