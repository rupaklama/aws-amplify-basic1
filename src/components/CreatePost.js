import { API, graphqlOperation, Auth } from 'aws-amplify';
import { useState, useEffect } from 'react';
import { createPost } from '../graphql/mutations';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: '',
    createdAt: new Date().toISOString(),
  });

  console.log(formData);

  const [error, setError] = useState('');

  const { postOwnerId, postOwnerUsername, postTitle, postBody, createdAt } = formData;

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    console.log(formData);

    try {
      await API.graphql(
        graphqlOperation(createPost, {
          input: { postOwnerId, postOwnerUsername, postTitle, postBody, createdAt },
        })
      );
    } catch (err) {
      setError('Sorry, something went wrong. Try again');
    }

    setFormData({ postTitle: '', postBody: '' });
  };

  if (error) return <div>{error}</div>;

  return (
    <form className='add-post' onSubmit={handleSubmit}>
      <input
        style={{ fontSize: '19px' }}
        type='text'
        placeholder='Title'
        value={postTitle}
        name='postTitle'
        required
        onChange={handleChange}
      />
      <textarea
        type='text'
        name='postBody'
        value={postBody}
        rows='3'
        cols='60'
        placeholder='New Blog Post'
        required
        onChange={handleChange}
      />

      <input type='submit' className='btn' style={{ fontSize: '19px' }} />
    </form>
  );
};

export default CreatePost;
