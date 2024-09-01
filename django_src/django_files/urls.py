"""quiz URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))

'''! @brief File that defines database models'''
"""

from django.contrib import admin
from django.urls import path, re_path
from app.custom_serializer import CustomAuthToken
from app.all_views import views_api, views_user
from app import views
from django_src.django_files import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

favicon_view = RedirectView.as_view(
    url='/static/images/favicon.webp', permanent=True)

urlpatterns = [
    # Frontend urls
    path('', views.login_view),

    # For users
    path('admin/', admin.site.urls),
    path('login/', views.login_view),
    path('register/', views.register_view),
    path('view-graphs/', views.graphs_view),

    # API urls
    # For users
    path('api/token/', CustomAuthToken.as_view()),
    path('api/register/', views_user.register_user),
    path('api/user_info/', views_user.user_info),
    path('api/all_entries/', views_api.get_all_entries),
    path('api/get_graphs/', views_api.get_graphs),

    # Extras
    path('favicon.ico/', favicon_view),
    path('health/', views.health),
    path('api-doc/', views.api_documentation),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

'''
For doxygen views, add this to urls:
 + \
    [
        #! Custom view for checking logged in user
        re_path(
            r'^doxygen-view/(?P<file_name>[^\.]+).html$', views.django_code_documentation)
] + static('/doxygen-view/', document_root=settings.DOXYGEN_ROOT)
'''
