import './App.css';
import AssetUploader from './Components/AssetUploader/AssetUploader';
import LoginButton from './Components/AuthTemp/LoginButton';
import LogoutButton from './Components/AuthTemp/LogoutButton';
import Background from './Components/Background/Background';
import BackgroundSelector from './Components/BackgroundSelector/BackgroundSelector';
import JournalEditor from './Components/JournalEditor/JournalEditor';
import PromptUploader from './Components/PromptUploader/PromptUploader';
import Achievements from './Components/AchievementsWidget/AchievementsWidget';
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
      {/* <Journal /> */}
      {/* <JournalEditor /> */}
      {/* <AssetUploader /> */}
    </div>
  );
}

export default App;
