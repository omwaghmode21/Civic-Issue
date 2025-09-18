import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HandThumbsUp, Chat, Share } from 'react-bootstrap-icons';

const mockPosts = [
  {
    id: 1,
    author: 'Priya Mehta',
    // New, stable image URL
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    time: '2 hours ago',
    text: 'A big thank you to the team who fixed the streetlight at Shivaji Park (CIV-002). It feels much safer now!',
    likes: 15,
    comments: 2,
  },
  {
    id: 2,
    author: 'Rohan Sharma',
    // New, stable image URL
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    time: '8 hours ago',
    text: 'Just reported a large pothole on M.G. Road (CIV-001). Please be careful if you are driving in that area.',
    likes: 8,
    comments: 5,
  },
  {
    id: 3,
    author: 'Community Updates',
    avatar: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    time: '12 hours ago',
    text: 'Check out this great video on how community engagement is making a real difference in parts of India.',
    likes: 45,
    comments: 12,
    videoUrl: 'https://www.youtube.com/embed/Aju1EgYXYWY'
  },
  {
    id: 4,
    author: 'Ankit Desai',
    // New, stable image URL
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    time: '1 day ago',
    text: 'Happy to see the waste collection issue (CIV-003) resolved so quickly. Great work by the municipal team!',
    likes: 22,
    comments: 3,
  }
];

// A reusable component for embedding videos
const VideoPlayer = ({ url }) => (
  <div className="ratio ratio-16x9 my-3">
    <iframe
      src={url}
      title="Community Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
);

function Community() {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState('');

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostObject = {
      id: posts.length + 1,
      author: 'Citizen User',
      // New, stable image URL for new posts
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      time: 'Just now',
      text: newPost,
      likes: 0,
      comments: 0,
    };

    setPosts([newPostObject, ...posts]);
    setNewPost('');
  };

  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Community Hub</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          See what's happening in your neighborhood. Share updates, thank the authorities, or discuss local issues.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* New Post Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <form onSubmit={handlePostSubmit}>
                <textarea
                  className="form-control border-0"
                  rows="3"
                  placeholder="Share an update or ask a question..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                ></textarea>
                <div className="d-flex justify-content-end mt-2">
                  <button type="submit" className="btn btn-primary">Post</button>
                </div>
              </form>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map(post => (
            <motion.div
              key={post.id}
              className="card shadow-sm mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: post.id * 0.1 }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-start">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="card-title mb-0">{post.author}</h5>
                    <small className="text-muted">{post.time}</small>
                  </div>
                </div>
                <p className="card-text fs-5 my-3">{post.text}</p>
                
                {post.videoUrl && <VideoPlayer url={post.videoUrl} />}

                <hr />
                <div className="d-flex justify-content-around">
                  <button className="btn btn-light w-100 me-2"><HandThumbsUp /> Like ({post.likes})</button>
                  <button className="btn btn-light w-100 me-2"><Chat /> Comment ({post.comments})</button>
                  <button className="btn btn-light w-100"><Share /> Share</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Community;