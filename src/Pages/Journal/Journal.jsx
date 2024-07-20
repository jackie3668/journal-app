import React from 'react'
import JournalEditor from '../../Components/JournalEditor/JournalEditor'
import Profile from '../../Components/AuthTemp/Profile'
import Background from '../../Components/Background/Background'

const Journal = () => {
  return (
    <div>
      <Background />
      <Profile />
      <JournalEditor />
    </div>
  )
}

export default Journal