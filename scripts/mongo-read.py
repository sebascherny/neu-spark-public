from pymongo import MongoClient
import os

DEFAULT_HOST = 'mongo1'

client = MongoClient(os.environ.get('MONGODB_HOST') or DEFAULT_HOST, 27017)


def get_detailed_time_to_value(one_entry, key):
    return one_entry['results'][key]['detailed']


def get_loss_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'loss')


def get_tput_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'tput')

db = client.get_database('AWS')
collection = db.get_collection('tcp')

for one_entry in collection.find():
    print(get_tput_detailed_time_to_value(one_entry))
    break

cursor = collection.find(
    {"info_rcv.ip_receiver": {"$eq": "52.74.90.178"}})

print(dir(cursor))
# print(cursor.next())
print('{} distinct starts: {}'.format(
    len(cursor.distinct('start')), cursor.distinct('start')))
for i, row in enumerate(cursor):
    if i == 0:
        print(row['info_rcv']['ip_receiver'])
print('total', i + 1)
print(dir(collection))
print(db.command("collstats", 'tcp'))

try:
    print('One user: ', client['AWS']['app_customuser'].find().next())
except:
    print('No users yet')

client.close()
