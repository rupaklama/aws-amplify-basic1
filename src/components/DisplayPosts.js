import { useEffect, useState, useRef } from 'react';

// API  - to query/fetch actual api from backend
// graphqlOperation - is one of the graphql query operation (mutations, queries or subscriptions)
import { API, graphqlOperation } from 'aws-amplify';

import { listPosts } from '../graphql/queries';
import { onCreatePost, onDeletePost } from '../graphql/subscriptions';

import DeletePost from './DeletePost';
import EditPost from './EditPost';

const DisplayPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  const subscriptionCreatePostRef = useRef();
  const subscriptionDeletePostRef = useRef();

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
          setError('Sorry, something went wrong. Try again');
          console.error('fetching posts', err);
        }
      }
    };

    getPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Adding Subscriptions and Refreshing UI with new Posts Automatically
  useEffect(() => {
    let isMounted = true;

    try {
      // creating post listener which is a subscription to update the display list after creating post
      subscriptionCreatePostRef.current = API.graphql(graphqlOperation(onCreatePost))
        // Attaching 'subscribe' method to get an Object which returns a Promise with 'next'
        .subscribe({
          // postData is indeed an Object that we need
          next: postData => {
            // to fetch new post with subscription
            const newPost = postData.value.data.onCreatePost;

            // using 'filter' in our component state - const [posts, setPosts] = useState([]);
            // to make sure we only get OLD previous posts only
            const prevPosts = posts.filter(post => post.id !== newPost.id);

            // adding new post to previous posts & creating a new array
            // we want to see newPost first - [newPost, ...prevPosts], order can be change
            const updatedPosts = [newPost, ...prevPosts];

            if (isMounted) {
              // set our component state to updated/new post lists
              setPosts(updatedPosts);
            }
          },
        });

      subscriptionDeletePostRef.current = API.graphql(graphqlOperation(onDeletePost)).subscribe({
        next: postData => {
          const deletedPost = postData.value.data.onDeletePost;
          const updatedPosts = posts.filter(post => post.id !== deletedPost.id);
          if (isMounted) {
            setPosts(updatedPosts);
          }
        },
      });
    } catch (err) {
      if (isMounted) {
        setError('Sorry, something went wrong. Try again');
        console.error('posts subscription', err);
      }
    }
    return () => {
      subscriptionCreatePostRef.current.unsubscribe();
      subscriptionDeletePostRef.current.unsubscribe();
      isMounted = false;
    };
  }, [posts]);

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
            <DeletePost postId={post.id} />
            <EditPost postId={post.id} />
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
