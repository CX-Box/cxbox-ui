<h2 align="center">CXBOX UI</h2>

<div align="center">
<a href="https://github.com/CX-Box/cxbox-ui/actions/workflows/build.yml"><img src="https://github.com/CX-Box/cxbox-ui/actions/workflows/build.yml/badge.svg" title="">
</a> 
<a href="https://sonarcloud.io/summary/overall?id=CX-Box_cxbox-ui"><img src="https://sonarcloud.io/api/project_badges/measure?project=CX-Box_cxbox-ui&metric=alert_status&branch=main" alt="sonar" title="">
</a>
</div>

<blockquote>
<div> 
<p align="center">
<h4 align="center">CXBOX - Rapid Enterprise Level Application Development Platform</h4>

<p align="center">
<a href="http://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg?style=flat" alt="license" title=""></a>
</p>

<div align="center">
  <h3>
    <a href="https://cxbox.org/" target="_blank">
      Website
    </a>
    <span> | </span>
    <a href="http://demo.cxbox.org/" target="_blank">
      Demo
    </a>
    <span> | </span>
    <a href="https://doc.cxbox.org/" target="_blank">
      Documentation
    </a>
  </h3>

</div>



<h3>Description</h2>
<p>
CXBOX main purpose is to speed up development of typical Enterprise Level Application based on Spring Boot. A fixed
contract with a user interface called <a href="https://github.com/CX-Box/cxbox-ui" target="_blank">Cxbox-UI</a> allows backend developer to create
typical interfaces providing just Json meta files. Full set of typical Enterprise Level UI components included -
widgets, fields, layouts (views), navigation (screens).
</p>
</div>

<h3>Using CXBOX</h2>
<ul>
<li> <a href="https://plugins.jetbrains.com/plugin/19523-tesler-helper" target="_blank">download Intellij Plugin</a> adds platform specific autocomplete, inspection, navigation and code generation features.
</li>
<li>
 <a href="https://github.com/CX-Box/cxbox-demo" target="_blank">download Demo</a> and follow <a href="https://github.com/CX-Box/cxbox-demo#readme" target="_blank">README.md</a> instructions. Feel free to use demo as template project to start your own projects
</li>
</ul>
</blockquote>

# CXBOX UI

## Main concepts

UI side of Cxbox framework is based on a concept of configurable dashboards ("views") with widgets. Visually widgets could be  represented as a card with a table, graph, form or something more exotic inside.
Internally, every widget has a direct link to an entity that we call "business component" (BC). BC controls what data is displayed on widget and whhich interactions are available to the user. Interactions could be a simple filtration or some complex business process, initiated through Cxbox API.
Information about loaded views and widgets grouped into "screens" and stored in application Redux store.
Client applications could reuse, extend and customize that functionality by providing its own reducers and epics, widgets and ui controls.

## Installation

Cxbox UI distributed in form of ES5 compatible npm package:
```sh
yarn add @cxbox-ui/core
```

Several libraries are specified as peer dependencies and should be installed for client application: react, react-dom, redux, react-redux, rxjs, redux-observable, antd, axios. 

## Usage

<Provider> component provides configurable Redux context and should be used on top level of your application:

```tsx
import {Provider} from '@cxbox-ui/core'
import {reducers} from 'reducers'

const App = <Provider>
    <div>Client side application</div>
</Provider>

render(App, document.getElementById('root'))
```

After that, components of your own application could access combined Redux store and import library components:

```tsx
import React from 'react'
import {connect, View} from '@cxbox-ui/core'

export const ClientComponent: FunctionComponent = (props: { screenName }) => {
    const Card = (props) => <div>
        <h1>Client side component</h1>
        {props.children}
    </div>
    return <View card={Card} />
}

function mapStateToProps(store) {
    return { screenName: store.router.screenName }
}

export default connect(mapStateToProps)(ClientComponent)
```

# Contributing

All contributions are welcomed, as even a minor pull request with grammar fixes or a single documentation update is of a significant help for us!  
We promise to handle all PR reviews in a friendly and respectful manner.
