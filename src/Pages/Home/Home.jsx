import React from 'react'
import ClockWidget from '../../Components/ClockWidget/ClockWidget'
import PresetWidget from '../../Components/PresetWidget/PresetWidget'
import PromptWidget from '../../Components/PromptWidget/PromptWidget'
import Achievements from '../Achievements/Achievements'

const Home = () => {
  return (
    <div>
      <ClockWidget />
      <PresetWidget />
      <PromptWidget />
      <Achievements />
    </div>
  )
}

export default Home