import React from 'react'
import PromptUploader from '../../Components/PromptUploader/PromptUploader'
import AssetUploader from '../../Components/AssetUploader/AssetUploader'
import { Scrollbar } from 'react-scrollbars-custom'

const Upload = () => {
  return (
    <div className='menu-container glass'>
      <Scrollbar style={{height: '70vh'}}>
        <AssetUploader />
        <PromptUploader />
      </Scrollbar>
    </div>
  )
}

export default Upload