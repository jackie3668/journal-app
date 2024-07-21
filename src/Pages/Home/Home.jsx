import React from 'react'
import ClockWidget from '../../Components/ClockWidget/ClockWidget'
import QuotesWidget from '../../Components/QuotesWidget/QuotesWidget'
import PresetWidget from '../../Components/PresetWidget/PresetWidget'

const Home = () => {
  return (
    <div>
      <ClockWidget />
      <QuotesWidget />
      <PresetWidget />
    </div>
  )
}

export default Home