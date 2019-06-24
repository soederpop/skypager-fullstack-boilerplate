import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import types from 'prop-types'

export default class HomePage extends Component {
  static contextTypes = {
    runtime: types.object
  }
  static propTypes = {
    
  }
  render() {
    return <Container>Home Page!!</Container>
  }
}