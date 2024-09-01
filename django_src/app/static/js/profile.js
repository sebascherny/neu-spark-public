'use strict';

const e = React.createElement;


function App() {
  const [userData, setUserData] = React.useState(null);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    // getPageLanguage((lang => { setPageLanguage(lang); }));
    get_user_data_api((data) => setUserData(data.data));
  };
  React.useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <UserHeader loggedInUsername={loggedInUsername ?? false}
        setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
      />
      {
        userData != null &&
        <div className='container_div' >
          <div style={{ padding: "1em" }}>
            <label>Email: </label>{'  '}
            < label > {userData.email} </label>
            < br />
          </div>
        </div>
      }
    </div>
  );
}


const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
