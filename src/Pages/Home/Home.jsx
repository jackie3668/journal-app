import React from 'react'
import ClockWidget from '../../Components/ClockWidget/ClockWidget'
import QuotesWidget from '../../Components/QuotesWidget/QuotesWidget'
import PresetWidget from '../../Components/PresetWidget/PresetWidget'
import PromptWidget from '../../Components/PromptWidget/PromptWidget'

const Home = () => {
  return (
    <div>
      <ClockWidget />
      <QuotesWidget />
      <PresetWidget />
      <PromptWidget />
    </div>
  )
}

export default Home