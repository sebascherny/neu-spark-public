const LOCAL_STORAGE_USER_TOKEN_KEY = "SPARK_DASH_UserToken";
const LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY = "loggedInUsername";
const REDIRECT_URL_IF_LOGIN = "/view-graphs";


function is_user_logged_in() {
  return localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY) != null
}

function redirect_if_logged_in_user() {
  if (is_user_logged_in()) {
    window.location.href = window.location.origin + REDIRECT_URL_IF_LOGIN;
  }
}

const login_api = async (username, password, fail) => {
  const response = await fetch(
    `/api/token/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": username,
        "password": password
      })
    }
  );
  const text = await response.text();
  const res_json = JSON.parse(text);
  if (response.status === 200) {
    console.log("success", res_json);
    await localStorage.setItem(LOCAL_STORAGE_USER_TOKEN_KEY, res_json.access);
    await localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY, res_json.username);
    window.location.href = REDIRECT_URL_IF_LOGIN;
  } else {
    console.log("failed", res_json);
    fail(res_json["detail"])
  }
};

const getLoggedInUsername = async (funcCall) => {
  const loggedInUsername = await localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY);
  funcCall(loggedInUsername);
};

const getPageLanguage = async (funcCall) => {
  const pageLanguage = "en"; // await localStorage.getItem("pageLanguage") || "en";
  funcCall(pageLanguage);
};

const setLocalStorageLanguage = async (lang) => {
  await localStorage.setItem("pageLanguage", lang);
}

const register_api = async (userInfo, fail) => {
  const response = await fetch(
    `/api/register/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    }
  );
  const res_json = await response.json();
  if (response.status === 200) {
    console.log("success", res_json);
    await localStorage.setItem(LOCAL_STORAGE_USER_TOKEN_KEY, res_json.access);
    await localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY, res_json.username);
    window.location.href = REDIRECT_URL_IF_LOGIN;
  } else {
    console.log("failed", res_json);
    fail(res_json["detail"])
  }
};

const validate_user_api = async (user_body, success, fail) => {
  const token = await localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location.href = "/login";
    return [];
  }
  const response = await fetch(
    `/api/validate/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(user_body)
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const user_logout = async () => {
  await localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_USERNAME_KEY);
  await localStorage.removeItem(LOCAL_STORAGE_USER_TOKEN_KEY);
}