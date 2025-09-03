import React, { useState, useEffect } from 'react';

// Mock data functions
const getBlogStats = () => ({
  totalPosts: 124,
  published: 89,
  drafts: 35,
  comments: 256,
  pageViews: 15420
});

const getRecentPosts = () => [
  { id: 1, title: 'Getting Started with React', date: '2023-10-15', views: 1245, comments: 12, status: 'Published' },
  { id: 2, title: 'Advanced JavaScript Patterns', date: '2023-10-10', views: 987, comments: 8, status: 'Published' },
  { id: 3, title: 'CSS Architecture for Large Apps', date: '2023-10-05', views: 756, comments: 5, status: 'Published' },
  { id: 4, title: 'Upcoming Web Development Trends', date: '2023-10-01', views: 0, comments: 0, status: 'Draft' }
];

const getTrafficData = () => [
  { day: 'Mon', visitors: 1245 },
  { day: 'Tue', visitors: 1324 },
  { day: 'Wed', visitors: 1532 },
  { day: 'Thu', visitors: 1421 },
  { day: 'Fri', visitors: 1689 },
  { day: 'Sat', visitors: 1923 },
  { day: 'Sun', visitors: 1745 }
];

// Stat card component
const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

// Recent posts component
const RecentPosts = ({ posts }) => (
  <div className="recent-posts">
    <h2>Recent Posts</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Views</th>
          <th>Comments</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(post => (
          <tr key={post.id}>
            <td>{post.title}</td>
            <td>{post.date}</td>
            <td>{post.views}</td>
            <td>{post.comments}</td>
            <td>
              <span className={`status ${post.status.toLowerCase()}`}>
                {post.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Traffic chart component
const TrafficChart = ({ data }) => (
  <div className="traffic-chart">
    <h2>Weekly Traffic</h2>
    <div className="chart-bars">
      {data.map((item, index) => (
        <div key={index} className="chart-bar">
          <div 
            className="bar" 
            style={{ height: `${item.visitors / 20}px` }}
          ></div>
          <span>{item.day}</span>
        </div>
      ))}
    </div>
  </div>
);

// Main dashboard component
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    // Simulate API calls
    setStats(getBlogStats());
    setRecentPosts(getRecentPosts());
    setTrafficData(getTrafficData());
  }, []);

  return (
    <div className="blog-dashboard">
      <header>
        <h1>Blog Dashboard</h1>
        <p>Welcome to your blog management dashboard</p>
      </header>
      
      <div className="stats-grid">
        <StatCard 
          title="Total Posts" 
          value={stats.totalPosts} 
          icon="📝" 
          color="#4caf50" 
        />
        <StatCard 
          title="Published" 
          value={stats.published} 
          icon="✅" 
          color="#2196f3" 
        />
        <StatCard 
          title="Drafts" 
          value={stats.drafts} 
          icon="📑" 
          color="#ff9800" 
        />
        <StatCard 
          title="Comments" 
          value={stats.comments} 
          icon="💬" 
          color="#e91e63" 
        />
        <StatCard 
          title="Page Views" 
          value={stats.pageViews} 
          icon="👁️" 
          color="#9c27b0" 
        />
      </div>
      
      <div className="dashboard-content">
        <RecentPosts posts={recentPosts} />
        <TrafficChart data={trafficData} />
      </div>
    </div>
  );
};

// Add some basic styling
const styles = `
  .blog-dashboard {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }
  
  header {
    margin-bottom: 30px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 15px;
  }
  
  .stat-content h3 {
    margin: 0;
    font-size: 24px;
  }
  
  .stat-content p {
    margin: 5px 0 0;
    color: #666;
  }
  
  .dashboard-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
  }
  
  .recent-posts, .traffic-chart {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
    color: #666;
  }
  
  .status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status.published {
    background: #e8f5e9;
    color: #4caf50;
  }
  
  .status.draft {
    background: #fff3e0;
    color: #ff9800;
  }
  
  .chart-bars {
    display: flex;
    align-items: flex-end;
    height: 200px;
    gap: 15px;
    margin-top: 20px;
  }
  
  .chart-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  
  .bar {
    width: 20px;
    background: #2196f3;
    border-radius: 4px 4px 0 0;
    margin-bottom: 8px;
  }
`;

// Render function (you would use ReactDOM.render in a real app)
const App = () => (
  <>
    <style>{styles}</style>
    <Dashboard />
  </>
);

export default App;