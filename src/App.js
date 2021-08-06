import { DataStore, Auth } from 'aws-amplify';
import { Post } from './models'
import PostView from './PostView';
import { useEffect, useState } from 'react';
import './App.css';
import LoginButton from './LoginButton';
import LoginPopup from './LoginPopup';
import { AuthState } from '@aws-amplify/ui-components';

function App() {
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState()
  const [showAuthenticator, setShowAuthenticator] = useState(false)

  const checkLoginState = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser()
      if (currentUser) {
        setCurrentUser(currentUser)
        setShowAuthenticator(false)
      }
    } catch (e) {
      setCurrentUser(null)
    }
  }

  useEffect(async () => {
    checkLoginState()
    const loadPosts = async () => {
      setPosts(await DataStore.query(Post))
    }
    loadPosts()

    const subscription = DataStore.observe(Post).subscribe(() => {
      loadPosts()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="App">
      <nav>
        <LoginButton
          onLogin={() => setShowAuthenticator(true)}
          currentUser={currentUser}
          onLogout={async () => {
            await Auth.signOut()
            checkLoginState()
          }} />

        {currentUser &&
          <button onClick={() => {
            DataStore.save(new Post({
              content: window.prompt('New post:')
            }))
          }}>
            📝 Add a new post
          </button>
        }
      </nav>
      <div className="posts">
        <h1>Posts</h1>
        {posts.map(post => <PostView post={post} currentUser={currentUser}/>)}
      </div>
      {showAuthenticator && 
        <LoginPopup
        onAuthStateChange={(nextAuthState) => { if (nextAuthState === AuthState.SignedIn) { checkLoginState() } }}
          onCancel={() => setShowAuthenticator(false)}/>}
    </div>
  );
}

export default App;
