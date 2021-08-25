import { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { updatePost } from '../graphql/mutations';

const EditPost = ({ postId, title, body }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: postId,
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: title,
    postBody: body,
    createdAt: new Date().toISOString(),
  });

  const [error, setError] = useState('');

  const { id, postOwnerId, postOwnerUsername, postTitle, postBody, createdAt } = formData;

  // componentWillMount = async () => {
  //   await Auth.currentUserInfo().then(user => {
  //     this.setState({
  //       postOwnerId: user.attributes.sub,
  //       postOwnerUsername: user.username,
  //     });
  //   });
  // };

  // Only current auth user can update the post therefore getting user id & username
  useEffect(() => {
    let isMounted = true;

    try {
      if (isMounted) {
        const user = async () => {
          // accessing auth user with Auth module
          await Auth.currentUserInfo().then(user => {
            // console.log('user name', user.username);
            // console.log('user sub/id', user.attributes.sub);
            setFormData({
              ...formData,
              postOwnerId: user.attributes.sub,
              postOwnerUsername: user.username,
            });
          });
        };

        user();
      }
    } catch (err) {
      if (isMounted) {
        console.error('auth user search', err);
        setError('Sorry something went wrong. Try again');
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModal = () => {
    setModalOpen(!isModalOpen);

    // modal position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const handleUpdatePost = async e => {
    e.preventDefault();

    try {
      await API.graphql(
        graphqlOperation(updatePost, {
          input: { id, postOwnerId, postOwnerUsername, postTitle, postBody, createdAt },
        })
      );
    } catch (err) {
      setError('Sorry, something went wrong. Try again');
      console.error('creating post', err);
    }

    //force close the modal
    setModalOpen(!isModalOpen);

    // refresh to display updated posts
    // window.location.reload();
  };

  const handleTitle = e => {
    setFormData({
      ...formData,
      postTitle: e.target.value,
    });
  };

  const handleBody = e => {
    setFormData({ ...formData, postBody: e.target.value });
  };

  return (
    <>
      {isModalOpen && (
        <div className='modal'>
          <button className='close' onClick={handleModal}>
            X
          </button>

          <form className='add-post' onSubmit={handleUpdatePost}>
            <input
              style={{ fontSize: '19px' }}
              type='text'
              placeholder='Title'
              name='postTitle'
              value={postTitle}
              onChange={handleTitle}
            />

            <input
              style={{ height: '150px', fontSize: '19px' }}
              type='text'
              name='postBody'
              value={postBody}
              onChange={handleBody}
            />

            <button>Update Post</button>
          </form>
        </div>
      )}

      <button onClick={handleModal}>Edit</button>

      {error && <p>{error}</p>}
    </>
  );
};

export default EditPost;
