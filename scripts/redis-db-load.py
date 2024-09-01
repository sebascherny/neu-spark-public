import json
import os
from pathlib import Path
import redis

REDIS_HOST = os.environ.get('REDIS_HOST')
REDIS_PORT = os.environ.get('REDIS_PORT')
REDIS_USERNAME = os.environ.get('REDIS_USERNAME')
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')


redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    username=REDIS_USERNAME,
    password=REDIS_PASSWORD,
    ssl=True,
)

p = Path(os.path.join(os.path.dirname(__file__), "../data/AWS/tcp"))
total_inserts = 0
total_regions = 0
total_files = 0
for q in [x for x in p.iterdir() if x.is_dir()]:
    total_regions += 1
    inserts = []
    print(str(q))
    for f in [x for x in q.iterdir() if x.is_file()]:
        print(str(f))
        total_files += 1
        with open(f) as file:
            file_data = json.load(file)
            for entry in file_data:
                redis_client.set(
                    total_inserts,
                    json.dumps(entry)
                )
                total_inserts += 1
                print(total_inserts)

print('Inserterd a total of {} entries from {} files from {} regions'.format(
    total_inserts, total_files, total_regions))
