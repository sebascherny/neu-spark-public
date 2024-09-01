if (!is_user_logged_in()) {
    const logout_header = document.getElementById("logout-header-li");
    if (logout_header) {
        logout_header.setAttribute('hidden', true);
    }
}
