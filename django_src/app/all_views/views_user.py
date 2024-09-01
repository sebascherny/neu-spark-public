from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.models import CustomUser
from app.custom_serializer import get_token_for_validated_user
import json


def serialize_user(user):
    ret = {
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_staff,
        "is_active": user.is_active
    }
    return ret


@api_view(['GET'])
def user_info(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    return HttpResponse(json.dumps({"data": serialize_user(request.user)}))


@api_view(['POST'])
def register_user(request):
    password = request.data.get("password")
    email = request.data.get("email")
    username = request.data.get("username")
    for field_name, field in (('username', username),
                              ('password', password),
                              ('email', email)):
        if (not field) or (not isinstance(field, str)):
            return HttpResponse(json.dumps({"success": False, "detail": "{} must be string".format(
                field_name
            )}), status=status.HTTP_400_BAD_REQUEST)
    try:
        CustomUser.objects.get(email=email)
        return HttpResponse(json.dumps({"success": False, "detail": "Email already exists"}), status=status.HTTP_403_FORBIDDEN)
    except CustomUser.DoesNotExist:
        try:
            CustomUser.objects.get(username=username)
            return HttpResponse(json.dumps({"success": False, "detail": "Username already exists"}), status=status.HTTP_403_FORBIDDEN)
        except CustomUser.DoesNotExist:
            new_user = CustomUser.objects.create(username=username,
                                                 email=email,
                                                 is_active=False)
            new_user.set_password(password)
            new_user.save()
            validate_user_and_get_message(new_user)
            json_ret = get_token_for_validated_user(new_user)
            json_ret['pending_validation'] = False
            json_ret["success"] = True
            return HttpResponse(json.dumps(json_ret), status=status.HTTP_200_OK)


def validate_user_and_get_message(user_to_validate):
    user_to_validate.is_active = True
    user_to_validate.save()
    message = 'User {} validated'.format(
        user_to_validate.username
    )
    return message
