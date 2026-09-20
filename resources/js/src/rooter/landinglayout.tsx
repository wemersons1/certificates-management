import React, { Fragment } from 'react'
import { Provider } from 'react-redux'
import store from '../redux/store'
import { Outlet } from 'react-router-dom'
import Landingswitcher from '../components/common/switcher/landingswitcher'

const Landinglayout = () => {
  return (
    <Fragment>
    <Provider store={store}>
        <Landingswitcher/>
        <div className='landing-page-wrapper'>
           <Outlet/>
        </div>
    </Provider>
</Fragment>
  )
}

export default Landinglayout