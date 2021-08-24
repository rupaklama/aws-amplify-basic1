import { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { updatePost } from '../graphql/mutations';

const EditPost = ({ postId }) => {
  const [error, setError] = useState('');

  const [showPopup] = useState({
    show: false,
    id: '',
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: '',
    createdAt: new Date().toISOString(),
  });

  const handleEditPost = async id => {
    try {
      await API.graphql(graphqlOperation(updatePost, { input: { id } }));
    } catch (err) {
      console.error('editing post', err);
      setError('Sorry something went wrong. Try again');
    }
  };

  return (
    <>
      <button onClick={() => handleEditPost(postId)}>Edit</button>
      {error && <p>{error}</p>}
    </>
  );
};

export default EditPost;
