from pymongo import MongoClient
import redis
import os
import json


MONGODB_HOST = os.environ.get('MONGODB_HOST') or 'mongo1'
MONGODB_PORT = os.environ.get('MONGODB_PORT') or 27017
MONGODB_USERNAME = os.environ.get('MONGODB_USERNAME')
MONGODB_PASSWORD = os.environ.get('MONGODB_PASSWORD')
MONGODB_NAME = os.environ.get('MONGODB_NAME') or 'AWS'


def get_region_from_entry(one_entry):
    return one_entry["camp"]["region_rcv"]


def get_detailed_time_to_value(one_entry, key):
    return one_entry['results'][key]['detailed']


def get_loss_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'loss')


def get_tput_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'tput')


def get_throughput_times(one_entry):
    tput_dict = get_tput_detailed_time_to_value(one_entry)
    if not tput_dict:
        return None
    return sorted([int(ts) for ts in list(tput_dict.keys())])


def get_throughput_vals(one_entry):
    tput_dict = get_tput_detailed_time_to_value(one_entry)
    if not tput_dict:
        return None
    return [tput_dict[str(ts)] for ts in get_throughput_times(one_entry)]


def get_topology_neightbours_list_and_names(one_entry):
    import random
    if random.randint(0, 1):
        return (
            [
                [1, 2],  # 0
                [2, 4],  # 1
                [3, 5],  # 2
                [5],  # 3
                [5, 6, 7],  # 4
                [7],  # 5
                [7, 8],  # 6
                [8],  # 7
                []  # 8
            ],
            ['A', 'BB', 'C', 'D', 'E', 'F', 'G', 'H']
        )
    else:
        return (
            [
                [1, 4],
                [2],
                [3, 4],
                [0, 4],
                []
            ],
            [0, 1, '2', '3XX', 4]
        )


class MongoDbCollection():

    def __init__(self, collection):
        self.collection = collection

    def find(self):  # iterator of entries
        return self.collection.find()
        # print('finddd')
        # for one_entry in self.collection.find():
        #    yield one_entry


class MongoDbCls():
    def __init__(self):
        client = MongoClient(
            host=MONGODB_HOST,
            port=int(MONGODB_PORT),
            username=MONGODB_USERNAME,
            password=MONGODB_PASSWORD
        )
        self.db_obj = client[MONGODB_NAME]

    def get_collection(self, table_name):
        return MongoDbCollection(self.db_obj.get_collection(table_name))


REDIS_HOST = os.environ.get('REDIS_HOST')
REDIS_PORT = os.environ.get('REDIS_PORT')
REDIS_USERNAME = os.environ.get('REDIS_USERNAME')
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')


class RedisDbCollection():

    def __init__(self, redis_client):
        self.redis_client = redis_client

    def find(self, limit=10):  # iterator of entries
        for key in self.redis_client.keys():
            yield json.loads(self.redis_client.get(key))
            limit -= 1
            if limit == 0:
                return


class RedisDbCls():
    def __init__(self):
        self.redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            username=REDIS_USERNAME,
            password=REDIS_PASSWORD,
            ssl=True,
        )

    def get_collection(self, table_name):
        return RedisDbCollection(self.redis_client)


def get_db_obj():
    if REDIS_USERNAME:
        print('Using Redis DB')
        return RedisDbCls()
    else:
        print('Using Mongo DB')
        return MongoDbCls()
