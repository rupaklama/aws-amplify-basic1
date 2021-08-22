import { withAuthenticator } from 'aws-amplify-react';

import './App.css';

import CreatePost from './components/CreatePost';
import DisplayPosts from './components/DisplayPosts';

function App() {
  return (
    <div className='App'>
      <CreatePost />
      <DisplayPosts />
    </div>
  );
}

// withAuthenticator - whether or not we want to see greeting
// true is to show greeting - (App, true);
// or pass an object - (App, { includeGreetings: true });
export default withAuthenticator(App, { includeGreetings: true });
