const LOCAL_STORAGE_USER_TOKEN_KEY = "SPARK_DASH_UserToken";
const LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY = "loggedInUsername";


const do_token_not_valid = async () => {
  await localStorage.removeItem(LOCAL_STORAGE_USER_TOKEN_KEY);
  await localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY);
  console.log("Token not valid");
  window.location.href = "/login";
  return [];
};


const no_token = () => {
  console.log("No credentials found, redirecting...");
  window.location.href = "/login";
  return [];
};

/*
const post_example = async (request_data, success, fail) => {
  const token = await localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);
  if (token === null) {
    return no_token();
  }
  const url = `/api/run_search_by_keywords/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'Application/JSON',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request_data)
  });
  const res_json = await response.json();
  if (response.status === 200) {
    console.log("success", res_json);
    success(res_json);
  } else {
    console.log("failed", res_json);
    fail(res_json)
  }
};

const get_example = async (success, fail) => {
  const token = await localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);
  if (token === null) {
    return no_token();
  }
  const url = `/api/get_unique_key/`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'Application/JSON',
      'Authorization': `Bearer ${token}`,
    }
  });
  const res_json = await response.json();
  if (response.status === 401) {
    return do_token_not_valid();
  }
  if (response.status === 200 || response.status === 201) {
    console.log("success", res_json);
    success(res_json);
  } else {
    console.log("failed", res_json);
    fail(res_json);
  }
}
*/

const get_graphs_api = async (success, fail) => {
  const token = await localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);
  if (token === null) {
    return no_token();
  }
  const url = `/api/get_graphs/`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'Application/JSON',
      'Authorization': `Bearer ${token}`,
    }
  });
  const res_json = await response.json();
  if (response.status === 401) {
    return do_token_not_valid();
  }
  if (response.status === 200 || response.status === 201) {
    console.log("success", res_json);
    success(res_json);
  } else {
    console.log("failed", res_json);
    fail(res_json);
  }
}