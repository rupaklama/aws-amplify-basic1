import { useEffect, useState } from 'react';

// API  - to query/fetch actual api from backend
// graphqlOperation - is one of the graphql query operation (mutations, queries or subscriptions)
import { API, graphqlOperation } from 'aws-amplify';

import { listPosts } from '../graphql/queries';
import { onCreatePost, onDeletePost, onUpdatePost } from '../graphql/subscriptions';

import DeletePost from './DeletePost';
import EditPost from './EditPost';

const DisplayPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  // const subscriptionCreatePostRef = useRef();
  // const subscriptionDeletePostRef = useRef();

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

    // NOTE - Adding Subscriptions and Refreshing UI with Newly UPDATED Posts Automatically

    const createPostListener = API.graphql(graphqlOperation(onCreatePost))
      // Attaching 'subscribe' method to get an Object which returns a Promise with 'next'
      .subscribe({
        // postData is indeed an Object that we need
        next: postData => {
          // to fetch new post with subscription
          const newPost = postData.value.data.onCreatePost;

          // with useState setter we have access to the previous state
          setPosts(prevPosts => {
            const oldPosts = prevPosts.filter(post => post.id !== newPost.id);
            const updatedPosts = [newPost, ...oldPosts];
            return updatedPosts;
          });

          // // using 'filter' in our component state - const [posts, setPosts] = useState([]);
          // // to make sure we only get OLD previous posts only
          // const prevPosts = posts.filter(post => post.id !== newPost.id);

          // // adding new post to previous posts & creating a new array
          // // we want to see newPost first - [newPost, ...prevPosts], order can be change
          // const updatedPosts = [newPost, ...prevPosts];

          // // set our component state to updated/new post lists
          // setPosts(updatedPosts);
        },
      });

    const deletePostListener = API.graphql(graphqlOperation(onDeletePost)).subscribe({
      next: postData => {
        const deletedPost = postData.value.data.onDeletePost;

        // const updatedPosts = posts.filter(post => post.id !== deletedPost.id);
        // setPosts(updatedPosts);

        setPosts(prevPosts => {
          const updatedPosts = prevPosts.filter(post => post.id !== deletedPost.id);
          return updatedPosts;
        });
      },
    });

    const updatePostListener = API.graphql(graphqlOperation(onUpdatePost)).subscribe({
      next: postData => {
        // current updated post
        const updatedPost = postData.value.data.onUpdatePost;

        // with useState setter we have access to the previous state
        setPosts(prevPosts => {
          // to find current updated post item's index in our posts array
          const index = prevPosts.findIndex(post => post.id === updatedPost.id);
          // console.log(index); returns '2'
          // So, the current updated post item is in array index - 2

          // now creating new updated posts array with three steps to organize array items order in an array
          const updatedPosts = [
            // spread is to unpack array items here

            // 2. our current updated post item - to show on the top on initial render
            updatedPost,

            // 1. all old posts without new updated post item
            ...prevPosts.slice(0, index),

            // 3. last part of an array after the updated post item
            // to add the next updated posts in the array list
            ...prevPosts.slice(index + 1),
          ];

          return updatedPosts;
        });
      },
    });

    return () => {
      createPostListener.unsubscribe();
      deletePostListener.unsubscribe();
      updatePostListener.unsubscribe();
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    window.location.reload();
    return <div>{error}</div>;
  }

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
            <EditPost title={post.postTitle} body={post.postBody} postId={post.id} />
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

// Adding Subscriptions and Refreshing UI with new Posts Automatically
// useEffect(() => {
//   let isMounted = true;

//   try {
//     // creating post listener which is a subscription to update the display list after creating post
//     subscriptionCreatePostRef.current = API.graphql(graphqlOperation(onCreatePost))
//       // Attaching 'subscribe' method to get an Object which returns a Promise with 'next'
//       .subscribe({
//         // postData is indeed an Object that we need
//         next: postData => {
//           // to fetch new post with subscription
//           const newPost = postData.value.data.onCreatePost;

//           // using 'filter' in our component state - const [posts, setPosts] = useState([]);
//           // to make sure we only get OLD previous posts only
//           const prevPosts = posts.filter(post => post.id !== newPost.id);

//           // adding new post to previous posts & creating a new array
//           // we want to see newPost first - [newPost, ...prevPosts], order can be change
//           const updatedPosts = [newPost, ...prevPosts];

//           if (isMounted) {
//             // set our component state to updated/new post lists
//             setPosts(updatedPosts);
//           }
//         },
//       });

//     subscriptionDeletePostRef.current = API.graphql(graphqlOperation(onDeletePost)).subscribe({
//       next: postData => {
//         const deletedPost = postData.value.data.onDeletePost;
//         const updatedPosts = posts.filter(post => post.id !== deletedPost.id);
//         if (isMounted) {
//           setPosts(updatedPosts);
//         }
//       },
//     });
//   } catch (err) {
//     if (isMounted) {
//       setError('Sorry, something went wrong. Try again');
//       console.error('posts subscription', err);
//     }
//   }
//   return () => {
//     subscriptionCreatePostRef.current.unsubscribe();
//     subscriptionDeletePostRef.current.unsubscribe();
//     isMounted = false;
//   };
// }, [posts]);
