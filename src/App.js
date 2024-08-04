import './App.css';
import AssetUploader from './Components/AssetUploader/AssetUploader';
import LoginButton from './Components/AuthTemp/LoginButton';
import LogoutButton from './Components/AuthTemp/LogoutButton';
import Background from './Components/Background/Background';
import BackgroundSelector from './Components/BackgroundSelector/BackgroundSelector';
import ClockWidget from './Components/ClockWidget/ClockWidget';
import JournalEditor from './Components/JournalEditor/JournalEditor';
import PromptUploader from './Components/PromptUploader/PromptUploader';
import Achievements from './Pages/Achievements/Achievements';
import Home from './Pages/Home/Home';
import Journal from './Pages/Journal/Journal';


function App() {  
  return (
    <div className="App">
      <LoginButton />
      <LogoutButton />
      <Home />
      <Background />
      {/* <BackgroundSelector /> */}
      {/* <PromptUploader /> */}
      <Journal />
      {/* <ClockWidget /> */}
      {/* <JournalEditor /> */}
      {/* <AssetUploader /> */}

    </div>
  );
}

export default App;
