"""! @brief File that defines database models"""

from django.contrib.auth.models import AbstractUser
from django.contrib import admin


MAX_LENGTH_CUSTOMCOLLECTION_NAME = 200
MAX_LENGTH_TOKEN_NAME = 1000


class CustomUser(AbstractUser):
    '''!
    @brief Object used for storing users in database
    '''

    def __str__(self):
        return str(self.username)

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'
        ordering = ["id"]
        app_label = 'app'


admin.site.register(CustomUser)
