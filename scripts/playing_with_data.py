import json
import os

js_file = os.path.join(os.path.dirname(
    __file__), '../data/AWS/tcp/EU-AP/ap-southeast-1a-m3.xlarge_eu-west-1a-m3.xlarge_1429001594_results.json')


def get_detailed_time_to_value(one_entry, key):
    return one_entry['results'][key]['detailed']


def get_loss_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'loss')


def get_tput_detailed_time_to_value(one_entry):
    return get_detailed_time_to_value(one_entry, 'tput')


with open(js_file, 'r') as f:
    entries = json.load(f)

for one_entry in sorted(entries, key=lambda entry: entry['start']):
    print(
        one_entry['start'],
        one_entry["info_rcv"]["ip_receiver"],
        one_entry["info_rcv"]["ip_sender"],
        sorted(get_detailed_time_to_value(one_entry, 'tput').keys())[0],
        sorted(get_detailed_time_to_value(one_entry, 'tput').keys())[-1]
    )
