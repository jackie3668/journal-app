import React from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';

const PresetWidget = () => {
  const { selectPreset } = useTheme();
  const [presets, setPresets] = React.useState([]);

  React.useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presets');
        setPresets(response.data);
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  const handlePresetChange = (event) => {
    const presetId = event.target.value;
    const selectedPreset = presets.find(preset => preset._id === presetId);
    selectPreset(selectedPreset);
  };

  return (
    <div>
      <label htmlFor="preset-select">Select a Preset:</label>
      <select id="preset-select" onChange={handlePresetChange}>
        <option value="">--Choose a Preset--</option>
        {presets.map(preset => (
          <option key={preset._id} value={preset._id}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PresetWidget;
