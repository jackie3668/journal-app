import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SOUND_CATEGORIES = [
  'Ambient',
  'Effects',
  'Human',
  'Music',
  'Nature',
  'Urban'
];

const PRESET_CATEGORIES = [
  'Cyberpunk',
  'Cozy Cottage',
  'Futuristic',
  'Retro',
  'Rustic',
  'Urban',
  'Nature',
  'Adventure'
];

const VIDEO_CATEGORIES = [
  'Urban',
  'Rustic',
  'Indoor',
  'Nature',
  'Scenic',
  'Fantasy',
  'Other'
];

const AssetUploader = () => {
  const [assets, setAssets] = useState([]);
  const [presets, setPresets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [type, setType] = useState('sound');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Ambient');
  const [presetCategory, setPresetCategory] = useState('Cyberpunk');
  const [videoCategory, setVideoCategory] = useState('Urban');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dropboxUrl, setDropboxUrl] = useState('');
  const [directDownloadUrl, setDirectDownloadUrl] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:5000/api/assets', {
        type,
        name,
        url,
        imageUrl,  // Added this field for image URL
        category
      });

      setSuccess('Asset uploaded successfully!');
      setName('');
      setUrl('');
      setImageUrl('');  // Reset the image URL field
      setCategory('Ambient');
      setAssets([...assets, response.data.asset]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload asset');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

const handlePresetSubmit = async (e) => {
  e.preventDefault();
  const presetName = e.target.elements.presetName.value;
  const selectedVideoId = e.target.elements.video.value; // Ensure this field is not empty
  const selectedAssets = [
    e.target.elements.typing.value,
    e.target.elements.sound1.value,
    e.target.elements.sound2.value,
    e.target.elements.sound3.value,
  ].filter(id => id);

  // Log values to verify correct data is being sent
  console.log('Preset Name:', presetName);
  console.log('Selected Video ID:', selectedVideoId);
  console.log('Selected Assets:', selectedAssets);

  const video = assets.find(asset => asset._id === selectedVideoId);
  if (!video || video.type !== 'video') {
    setError('Invalid video selection');
    return;
  }

  const assetURLs = selectedAssets.map(id => assets.find(asset => asset._id === id)?.name);

  try {
    const response = await axios.post('http://localhost:5000/api/presets', {
      name: presetName,
      assets: assetURLs,
      videoId: selectedVideoId, 
      imageUrl: video.imageUrl,
      category: presetCategory
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    setSuccess('Preset created successfully!');
    setPresets([...presets, {
      _id: response.data.presetId,
      name: presetName,
      assets: assetURLs,
      imageUrl: video.imageUrl,
      category: presetCategory
    }]);
  } catch (err) {
    console.error('Error response:', err.response);
    setError(err.response?.data?.error || 'Failed to create preset');
  }
};

  
  const handleChange = (e, field) => {
    setEditFields({ ...editFields, [field]: e.target.value });
  };
  

  const handleEdit = (id) => {
    const asset = assets.find(a => a._id === id);
    if (asset) {
      setEditingId(id);
      setEditFields({
        name: asset.name,
        url: asset.url,
        imageUrl: asset.imageUrl,
        category: asset.category
      });
    }
  };
  
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/assets/${editingId}`, editFields);
      setAssets(assets.map(asset =>
        asset._id === editingId ? { ...asset, ...editFields } : asset
      ));
      setEditingId(null);
      setEditFields({});
    } catch (err) {
      console.error('Error updating asset:', err);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/assets/${id}`);
      setAssets(assets.filter(asset => asset._id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  const convertToDirectDownload = (url) => {
    const regex = /https:\/\/www\.dropbox\.com\/scl\/fi\/(.+?)\?(.+?)&dl=0/;
    const match = url.match(regex);
    if (match) {
      return `https://www.dropbox.com/scl/fi/${match[1]}?${match[2]}&dl=1`;
    }
    return '';
  };

  const handleDropboxSubmit = (e) => {
    e.preventDefault();
    const directDownloadUrl = convertToDirectDownload(dropboxUrl);
    setDirectDownloadUrl(directDownloadUrl);
  };

  const handlePresetDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/presets/${id}`);
      setPresets(presets.filter(preset => preset._id !== id));
    } catch (err) {
      console.error('Error deleting preset:', err);
    }
  };

  const getCategoryOptions = () => {
    switch (type) {
      case 'sound':
        return SOUND_CATEGORIES;
      case 'video':
        return VIDEO_CATEGORIES;
      default:
        return [];
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
            <option value="sound">Sound</option>
            <option value="video">Video</option>
            <option value="typing">Typing Sound</option>
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
        <div>
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {getCategoryOptions().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <h2>Create Preset</h2>
      <form onSubmit={handlePresetSubmit}>
        <div>
          <label htmlFor="presetName">Preset Name:</label>
          <input
            id="presetName"
            type="text"
            required
          />
        </div>
        <div>
          <label htmlFor="presetImageUrl">Preset Image URL:</label>
          <input
            id="presetImageUrl"
            type="text"
          />
        </div>
        <div>
          <label htmlFor="presetCategory">Category:</label>
          <select
            id="presetCategory"
            value={presetCategory}
            onChange={(e) => setPresetCategory(e.target.value)}
          >
            {PRESET_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="video">Video:</label>
          <select id="video" name="video">
            {assets.filter(a => a.type === 'video').map(video => (
              <option key={video._id} value={video._id}>{video.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="typing">Typing Sound:</label>
          <select id="typing" name="typing">
            {assets.filter(a => a.type === 'typing').map(sound => (
              <option key={sound._id} value={sound._id}>{sound.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound1">Sound 1:</label>
          <select id="sound1" name="sound1">
            {assets.filter(a => a.type === 'sound').map(sound => (
              <option key={sound._id} value={sound._id}>{sound.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound2">Sound 2:</label>
          <select id="sound2" name="sound2">
            {assets.filter(a => a.type === 'sound').map(sound => (
              <option key={sound._id} value={sound._id}>{sound.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sound3">Sound 3:</label>
          <select id="sound3" name="sound3">
            {assets.filter(a => a.type === 'sound').map(sound => (
              <option key={sound._id} value={sound._id}>{sound.name}</option>
            ))}
          </select>
        </div>
        <button type="submit">Create Preset</button>
      </form>

      <h2>Convert Dropbox Link</h2>
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
        <button type="submit">Convert</button>
      </form>
      {directDownloadUrl && (
        <div>
          <p>Direct Download URL:</p>
          <a href={directDownloadUrl} target="_blank" rel="noopener noreferrer">
            {directDownloadUrl}
          </a>
        </div>
      )}

<h2>Assets</h2>
      <ul>
        {assets.map(asset => (
          <li key={asset._id}>
            {asset.name} ({asset.type}) - {asset.category}
            {asset.imageUrl && (
              <div>
                <img src={asset.imageUrl} alt={asset.name} style={{ width: '150px', height: 'auto' }} />
                <p>Thumbnail</p>
              </div>
            )}
            <button onClick={() => handleEdit(asset._id)}>Edit</button>
            <button onClick={() => handleDelete(asset._id)}>Delete</button>
            {editingId === asset._id && (
              <div>
                <input
                  type="text"
                  value={editFields.name}
                  onChange={(e) => handleChange(e, 'name')}
                />
                <input
                  type="text"
                  value={editFields.url}
                  onChange={(e) => handleChange(e, 'url')}
                />
                <input
                  type="text"
                  value={editFields.imageUrl}
                  onChange={(e) => handleChange(e, 'imageUrl')}
                />
                <input
                  type="text"
                  value={editFields.category}
                  onChange={(e) => handleChange(e, 'category')}
                />
                <button onClick={handleUpdate}>Update</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h2>Presets</h2>
      <ul>
        {presets.map(preset => (
          <li key={preset._id}>
            {preset.name} - {preset.category}
            {preset.imageUrl && <img src={preset.imageUrl} alt={preset.name} style={{ width: '100px', height: 'auto' }} />}
            <button onClick={() => handlePresetDelete(preset._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetUploader;
