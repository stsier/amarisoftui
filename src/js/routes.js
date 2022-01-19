
import HomePage from '../pages/home.jsx';

var routes = [
  {
    path: '/',
    component: HomePage,
    options: {
      props: {
        foo: 'bar',
        bar: true,
      },
    }
  },
];

export default routes;
