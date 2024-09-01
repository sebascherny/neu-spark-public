#!/bin/bash
echo "mongo1 initializing rs..."
mongosh --eval "rs.initiate({
 _id: \"mongo-rs\",
 members: [
   {_id: 0, host: \"mongo1\"},
   {_id: 1, host: \"mongo2\"}
 ]
})"
echo "mongo1 initialized rs..."