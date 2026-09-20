import React, { Fragment } from 'react'
import { Provider } from 'react-redux'
import store from '../redux/store'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import Authenticationswitcher from '../components/common/switcher/authenticationswitcher'

const Authenticationlayout = () => {
  return (
    <Fragment>
    <Provider store={store}>
        <HelmetProvider>
            <Helmet>
                <body className=''></body>
            </Helmet>
            <Outlet/>
            <Authenticationswitcher/>
        </HelmetProvider>
    </Provider>
</Fragment>
  )
}

export default Authenticationlayout