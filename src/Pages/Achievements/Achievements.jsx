import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const Achievements = () => {
  const { authState } = useAuth();
  const { user } = authState;

  // Ensure user is available before attempting to fetch achievements
  const [achievements, setAchievements] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      // Check if user is available

      try {
      
        const response = await axios.get(`http://localhost:5000/api/achievements/${authState.user.sub}`);
        console.log(response.data);
        setAchievements(response.data);
      } catch (err) {
        setError('Error fetching achievements: ' + (err.response?.data?.message || err.message));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]); // Include user in the dependency array to refetch when user changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!achievements) return <p>No achievements data available.</p>;

  return (
    <div className="achievements-container">
      <h2>Your Achievements</h2>
      {Object.keys(achievements).length === 0 ? (
        <p>No achievements to display.</p>
      ) : (
        <ul className="achievements-list">
          <li className="achievement-item">
            <h3>Total Word Count</h3>
            <p>{achievements.totalWordCount}</p>
          </li>
          <li className="achievement-item">
            <h3>Entry Count</h3>
            <p>{achievements.entryCount}</p>
          </li>
          <li className="achievement-item">
            <h3>Folder Count</h3>
            <p>{achievements.folderCount}</p>
          </li>
          <li className="achievement-item">
            <h3>Prompt Usage</h3>
            <p>{achievements.promptUsage}</p>
          </li>
          <li className="achievement-item">
            <h3>Time Spent Writing</h3>
            <p>{Math.floor(achievements.timeSpentWriting / 60)}m {achievements.timeSpentWriting % 60}s</p>
          </li>
          <li className="achievement-item">
            <h3>Tag Usage</h3>
            <ul>
              {Object.entries(achievements.tagUsage || {}).map(([tag, count]) => (
                <li key={tag}>
                  {tag}: {count}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Achievements;
