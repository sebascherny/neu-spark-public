"""! @brief File that defines the endpoints exposed for the frontend demo"""

from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
import json
from django_src.utils import get_db_obj, get_region_from_entry, get_throughput_times, get_throughput_vals, get_topology_neightbours_list_and_names
from bson.json_util import dumps


@ api_view(['GET'])
def get_all_entries(request):

    if request.method == "GET":

        db_obj = get_db_obj()
        collection = db_obj.get_collection('tcp')
        ret = []

        for one_entry in collection.find():
            ret.append(one_entry)

        max_limit = 10

        return HttpResponse(dumps({
            'code': 200,
            'success': True,
            'msg': 'success',
            'all_entries': ret[:max_limit],
        }))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET'])
def get_graphs(request):

    if request.method == "GET":

        db_obj = get_db_obj()
        collection = db_obj.get_collection('tcp')
        throughput_graphs = []
        topologies = []

        count_region = {}
        for one_entry in collection.find():
            region = get_region_from_entry(one_entry)
            tput_times = get_throughput_times(one_entry)
            tput_vals = get_throughput_vals(one_entry)
            if region and tput_times and tput_vals:
                if not region in count_region:
                    count_region[region] = 0
                count_region[region] += 1
                throughput_graphs.append(
                    [region + '-' + str(count_region[region]),
                     tput_times, tput_vals]
                )
                topologies.append(
                    get_topology_neightbours_list_and_names(one_entry)
                )

        max_limit = 10

        return HttpResponse(dumps({
            'code': 200,
            'success': True,
            'msg': 'success',
            'data': {
                'entries': throughput_graphs,
                'topologies': topologies
            }
        }))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
