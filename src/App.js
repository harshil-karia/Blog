import Header from "./Header";
import Nav from "./Nav";
import Footer from "./Footer";
import Home from "./Home";
import NewPost from "./NewPost";
import PostPage from "./PostPage";
import About from "./About";
import Missing from "./Missing";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from './api/posts';

function App() {

  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try{
        const response = await api.get('/posts');
        setPosts(response.data);
      } catch(err) {
        if(err.response){
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log(`Error : ${err.message}`);
        }
      }
    }

    fetchPosts();
  },[])

  useEffect(() => {
    const filteredResults = posts.filter(post => 
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));

      setSearchResult(filteredResults.reverse());
  },[posts, search])

  const handleSubmit = async (e) =>{
    e.preventDefault();
    const id = posts.length ? parseInt(posts[posts.length - 1].id) + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, title: postTitle, datetime, body: postBody};
    try{
      const response = await api.post('/posts', newPost);
      const allPosts = [...posts, response.data];
      setPosts(allPosts);
      setPostTitle('');
      setPostBody('');
      navigate('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }

  const handleDelete = async (id) => {
    const deleteUrl = `/posts/${id}`;
    console.log(deleteUrl)
    //console.log(`Deleting post with ID: ${id}, URL: ${deleteUrl}`);
    try{
      await api.delete(`/posts/${id}`);
      console.log('Hi')
      const postsList = posts.filter(post => post.id !== id);
      setPosts(postsList);
      navigate('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
    
  }
  return (
    <div className="App">
        <Header tittle={"React JS Blog"} />
        <Nav search={search} setSearch={setSearch} />
        <Routes>
          <Route exact path="/" element={<Home posts={searchResult} />} />
          <Route path="/post" element={<NewPost 
            postTitle={postTitle}
            setPostTitle={setPostTitle}
            postBody={postBody}
            setPostBody={setPostBody}
            handleSubmit={handleSubmit}
          />} />
          <Route path="/post/:id" element={<PostPage posts={posts} handleDelete={handleDelete}/>} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Missing />} />
        </Routes>     
        <Footer />
    </div>
  );
}

export default App;
