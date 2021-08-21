import { useEffect, useState } from 'react';

// API  - to query/fetch actual api from backend
// graphqlOperation - is one of the graphql query operation (mutations, queries or subscriptions)
import { API, graphqlOperation } from 'aws-amplify';

import { listPosts } from '../graphql/queries';
import DeletePost from './DeletePost';
import EditPost from './EditPost';

const DisplayPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  console.log(posts);

  useEffect(() => {
    let isMounted = true;

    const getPosts = async () => {
      try {
        const response = await API.graphql(graphqlOperation(listPosts));
        const data = response.data.listPosts.items;

        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Sorry, something went wrong. Try again later');
        }
      }
    };

    getPosts();

    return () => (isMounted = false);
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      {posts.map(post => (
        <div className='posts' key={post.id} style={rowStyle}>
          <h1>{post.postTitle}</h1>

          <span style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
            {'wrote by: '} {post.postOwnerUsername}
            {' on '}
            <time style={{ fontStyle: 'italic' }}>{new Date(post.createdAt).toDateString()}</time>
          </span>

          <p>{post.postBody}</p>

          <br />
          <span>
            <DeletePost />
            <EditPost />
          </span>
        </div>
      ))}
    </div>
  );
};

const rowStyle = {
  background: '#f4f4f4',
  padding: '10px',
  border: '1px #ccc dotted',
  margin: '14px',
};

export default DisplayPosts;
