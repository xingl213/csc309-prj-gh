import { BrowserRouter, Routes, Route, IndexRoute } from 'react-router-dom';
import Signup from './components/signup/index';
import Login from './components/login/index';
import Profile from './components/profile/index';
import EditProfile from './components/edit_profile/index';
import PaymentHistory from './components/payment/paymentHistory';
import NextPayment from './components/payment/nextPayment';
import Info from './components/studioInfo';
import SearchStudio from './components/search/studioSearch';
import SearchClassInstance from './components/search/classInstanceSearch';
import SearchStudioForm from './components/search/studioSearchForm';
import Images from './components/studioImages/index';
import Amenities from './components/studioAmenities/index';
import StudioSchedule from './components/studioClassSchedule/index';
import SearchClassInstanceForm from './components/search/classInstanceSearchForm';
import Home from './components/landingPage/index';
import ClosestStudio from './components/closestStudio';
import ChangeCard from './components/changeCard';
import ProfileTab from './components/profileTab';
import ChangeSubscription from './components/changeSubscription';
import UserSchedule from './components/userClassSchedule';
import Navbar from './components/navbar';
import { Layout } from 'antd';
import NotFound from './components/notFound';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    // add more as we go
    <Layout>
      <BrowserRouter>
      <Header>
        <Navbar/>
      </Header>
      <Content>
      <Routes>

        <Route path="/">
          <Route index element={<Home />} />

          <Route path="accounts/">

            <Route path="signup/" element={<Signup />} />
            <Route path="login/" element={<Login />} />
            <Route path="profile/view/" element={<ProfileTab />} />
            <Route path="profile/edit/" element={<EditProfile />} />
            <Route path="payment-history/" element={<PaymentHistory />} />
            <Route path="future-payment/" element={<NextPayment />} />
            <Route path="edit-payment/" element={<ChangeCard />} />
            <Route path="edit-subscription/" element={<ChangeSubscription />} />
            <Route path="classes/schedule/" element={<UserSchedule />} />

          </Route>

          <Route path="studios/">

            <Route path=":studioId/info/" element={<Info />} />
            <Route path="search-form/" element={<SearchStudioForm />} />
            <Route path="search" element={<SearchStudio />} />
            <Route path=":studioId/search" element={<SearchClassInstance />} />
            <Route path=":studioId/images/" element={<Images />} />
            <Route path=":studioId/amenities/" element={<Amenities />} />
            <Route path=":studioId/classes/schedule/" element={<StudioSchedule />} />
            <Route path=":studioId/search-form/" element={<SearchClassInstanceForm />} />
            <Route path="closest_studio/" element = {<ClosestStudio />} />

          </Route>

          <Route path='*' element={<NotFound />}/>

        </Route>

      </Routes>
      </Content>
    <Footer>
      Toronto Fitness Club ©2022
    </Footer>
    </BrowserRouter>
    </Layout>
  );
}

export default App;
