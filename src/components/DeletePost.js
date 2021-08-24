import { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../graphql/mutations';

const DeletePost = ({ postId }) => {
  const [error, setError] = useState('');

  const handleDeletePost = async id => {
    try {
      await API.graphql(graphqlOperation(deletePost, { input: { id } }));
    } catch (err) {
      console.error('deleting post', err);
      setError('Sorry something went wrong. Try again');
    }
  };

  return (
    <>
      <button onClick={() => handleDeletePost(postId)}>Delete</button>
      {error && <p>{error}</p>}
    </>
  );
};

export default DeletePost;
