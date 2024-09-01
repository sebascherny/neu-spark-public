import json
import os
from pathlib import Path
from pymongo import MongoClient, InsertOne

DEFAULT_HOST = 'mongo1'

client = MongoClient(os.environ.get('MONGODB_HOST') or DEFAULT_HOST, 27017)

p = Path(os.path.join(os.path.dirname(__file__), "../data/AWS/tcp"))
total_inserts = 0
total_regions = 0
total_files = 0
for q in [x for x in p.iterdir() if x.is_dir()]:
    total_regions += 1
    inserts = []
    print(str(q))
    for f in [x for x in q.iterdir() if x.is_file()]:
        # print(str(f))
        total_files += 1
        with open(f) as file:
            file_data = json.load(file)
            for entry in file_data:
                inserts.append(InsertOne(entry))
    total_inserts += len(inserts)
    result = client["AWS"]["tcp"].bulk_write(inserts)

print('Inserterd a total of {} entries from {} files from {} regions'.format(
    total_inserts, total_files, total_regions))
client.close()
