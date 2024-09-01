"""! @brief File that defines frontend views"""

import json
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status

# Create your views here.


def login_view(request):
    context = {}
    return render(request, "account-signin.html", context=context)


def register_view(request):
    context = {}
    return render(request, "account-signup.html", context=context)


def graphs_view(request):
    context = {}
    return render(request, "graph_view.html", context=context)


def profile_view(request):
    context = {}
    return render(request, "profile.html", context=context)


def api_documentation(request):
    context = {}
    return render(request, "api_doc.html", context=context)


def health(_request):
    return HttpResponse(json.dumps({"success": True, "message": "Up and running!"}), status=status.HTTP_200_OK)
