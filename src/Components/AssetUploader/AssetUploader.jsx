import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AssetUploader = () => {
  const [assets, setAssets] = useState([]);
  const [presets, setPresets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [type, setType] = useState('music');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for Dropbox URL conversion
  const [dropboxUrl, setDropboxUrl] = useState('');
  const [directDownloadUrl, setDirectDownloadUrl] = useState('');

  // Fetch assets and presets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        setAssets(response.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      }
    };

    const fetchPresets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presets');
        setPresets(response.data);
      } catch (err) {
        console.error('Error fetching presets:', err);
      }
    };

    fetchAssets();
    fetchPresets();
  }, []);

  // Handle form submission for uploading a new asset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:5000/api/assets', {
        type,
        name,
        url
      });

      setSuccess('Asset uploaded successfully!');
      console.log('Response:', response.data);
      setName('');
      setUrl('');
      setAssets([...assets, response.data.asset]); // Add the new asset to the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload asset');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating a new preset
  const handlePresetSubmit = async (e) => {
    e.preventDefault();
    const presetName = e.target.elements.presetName.value;
    const selectedAssets = {
      video: e.target.elements.video.value,
      typing: e.target.elements.typing.value,
      sound1: e.target.elements.sound1.value,
      sound2: e.target.elements.sound2.value,
      sound3: e.target.elements.sound3.value,
    };
  
    const assetURLs = Object.values(selectedAssets)
      .filter(id => id) // Filter out empty values
      .map(id => assets.find(asset => asset._id === id)?.name); // Map to URLs
  
    try {
      const response = await axios.post('http://localhost:5000/api/presets', {
        name: presetName,
        assets: assetURLs
      });
      
      setSuccess('Preset created successfully!');
      setPresets([...presets, { name: presetName, assets: assetURLs }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create preset');
      console.error('Error:', err);
    }
  };
  
  // Handle input changes during editing
  const handleChange = (e, field) => {
    setEditFields({ ...editFields, [field]: e.target.value });
  };

  // Start editing an asset
  const handleEdit = (id, field, value) => {
    setEditingId(id);
    setEditFields({ [field]: value });
  };

  // Update an asset
  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/assets/${id}`, editFields);
      
      setAssets(assets.map(asset =>
        asset._id === id ? { ...asset, ...editFields } : asset
      ));
      
      setEditingId(null);
      setEditFields({});
    } catch (err) {
      console.error('Error updating asset:', err);
    }
  };

  // Delete an asset
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/assets/${id}`);
      setAssets(assets.filter(asset => asset._id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  // Convert Dropbox link to direct download link
  const convertToDirectDownload = (url) => {
    const regex = /https:\/\/www\.dropbox\.com\/scl\/fi\/(.+?)\?(.+?)&dl=0/;
    const match = url.match(regex);
    if (match) {
      return `https://www.dropbox.com/scl/fi/${match[1]}?${match[2]}&dl=1`;
    }
    return '';
  };

  // Handle Dropbox URL input and conversion
  const handleDropboxSubmit = (e) => {
    e.preventDefault();
    const directDownloadUrl = convertToDirectDownload(dropboxUrl);
    setDirectDownloadUrl(directDownloadUrl);
  };

  // Handle deleting a preset
  const handlePresetDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/presets/${id}`);
      setPresets(presets.filter(preset => preset._id !== id));
    } catch (err) {
      console.error('Error deleting preset:', err);
    }
  };

  return (
    <div>
      <h2>Upload Asset</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="type">Type:</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="music">Music</option>
            <option value="typing">Typing Sound</option>
            <option value="sound">Sound</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="url">URL:</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <h2>Create Preset</h2>
      <form onSubmit={handlePresetSubmit}>
        <div>
          <label htmlFor="presetName">Preset Name:</label>
          <input id="presetName" type="text" required />
        </div>
        <div>
          <label htmlFor="video">Video:</label>
          <select id="video">
            <option value="">Select Video</option>
            {assets.filter(asset => asset.type === 'video').map(asset => (
              <option key={asset._id} value={asset._id}>{asset.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="typing">Typing Sound:</label>
          <select id="typing">
            <option value="">Select Typing Sound</option>
            {assets.filter(asset => asset.type === 'typing').map(asset => (
              <option key={asset._id} value={asset._id}>{asset.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound1">Sound 1:</label>
          <select id="sound1">
            <option value="">Select Sound 1</option>
            {assets.filter(asset => asset.type === 'sound').map(asset => (
              <option key={asset._id} value={asset._id}>{asset.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound2">Sound 2:</label>
          <select id="sound2">
            <option value="">Select Sound 2</option>
            {assets.filter(asset => asset.type === 'sound').map(asset => (
              <option key={asset._id} value={asset._id}>{asset.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound3">Sound 3:</label>
          <select id="sound3">
            <option value="">Select Sound 3</option>
            {assets.filter(asset => asset.type === 'sound').map(asset => (
              <option key={asset._id} value={asset._id}>{asset.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Preset'}
        </button>
      </form>

      <h2>Convert Dropbox URL to Direct Download Link</h2>
      <form onSubmit={handleDropboxSubmit}>
        <div>
          <label htmlFor="dropboxUrl">Dropbox URL:</label>
          <input
            id="dropboxUrl"
            type="text"
            value={dropboxUrl}
            onChange={(e) => setDropboxUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>
      {directDownloadUrl && (
        <div>
          <h3>Direct Download Link:</h3>
          <a href={directDownloadUrl} target="_blank" rel="noopener noreferrer">
            {directDownloadUrl}
          </a>
        </div>
      )}

      <h2>Assets</h2>
      {loading && <p>Loading assets...</p>}
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => (
            <tr key={asset._id}>
              <td>
                {editingId === asset._id ? (
                  <input
                    type="text"
                    value={editFields.type || asset.type}
                    onChange={(e) => handleChange(e, 'type')}
                  />
                ) : (
                  asset.type
                )}
              </td>
              <td>
                {editingId === asset._id ? (
                  <input
                    type="text"
                    value={editFields.name || asset.name}
                    onChange={(e) => handleChange(e, 'name')}
                  />
                ) : (
                  asset.name
                )}
              </td>
              <td>
                {editingId === asset._id ? (
                  <input
                    type="text"
                    value={editFields.url || asset.url}
                    onChange={(e) => handleChange(e, 'url')}
                  />
                ) : (
                  asset.url
                )}
              </td>
              <td>
                {editingId === asset._id ? (
                  <button onClick={() => handleUpdate(asset._id)}>Save</button>
                ) : (
                  <>
                    <button onClick={() => handleEdit(asset._id, 'type', asset.type)}>Edit</button>
                    <button onClick={() => handleDelete(asset._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Presets</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Assets</th>
            <th>Actions</th> {/* New column for actions */}
          </tr>
        </thead>
        <tbody>
          {presets.map(preset => (
            <tr key={preset._id}>
              <td>{preset.name}</td>
              <td>
                {preset.assets.join(', ')}
              </td>
              <td>
                <button onClick={() => handlePresetDelete(preset._id)}>Delete</button> {/* Delete button */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetUploader;
