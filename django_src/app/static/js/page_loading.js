document.addEventListener("DOMContentLoaded", function () {
    const preloader = document.querySelector('.page-loading');
    preloader.classList.remove('active');
    setTimeout(function () {
        preloader.remove();
    }, 1000);
});
