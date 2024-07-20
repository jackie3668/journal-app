import './App.css';
import AssetUploader from './Components/AssetUploader/AssetUploader';
import LoginButton from './Components/AuthTemp/LoginButton';
import LogoutButton from './Components/AuthTemp/LogoutButton';
import ClockWidget from './Components/ClockWidget/ClockWidget';
import JournalEditor from './Components/JournalEditor/JournalEditor';
import QuotesWidget from './Components/QuotesWidget/QuotesWidget';
import Journal from './Pages/Journal/Journal';


function App() {  
  return (
    <div className="App">
      {/* <LoginButton />
      <LogoutButton /> */}
      <Journal />
      {/* <ClockWidget /> */}
      {/* <QuotesWidget /> */}
      {/* <JournalEditor /> */}
      {/* <AssetUploader /> */}
    </div>
  );
}

export default App;
