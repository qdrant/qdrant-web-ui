import { Link } from "react-router-dom";
import Header from '../Components/Header/Header';
import Sidebar from '../Components/Sidebar/Sidebar';
import Footer from '../Components/Footer/Footer';
import Main from '../Components/Main/Main';

function Home() {
  return (
    <div className="grid-container Home">
      <Header />
      <Sidebar />
      <Main />
      <Footer />
    </div>
  );
}

export default Home;