# generate video watching list start from one video
# wathc list
# {
#     channel:"",
#     channel_url:"",
#     channel_subscribers:"",
#     video_url:"",
#     video_name:"",
#     from_video:"",
#     from_channel:"",
# }
# channel node
# {
#     channel:"",
#     channel_url:"",
#     channel_subscribers:"",
#     watched_videos:""
# }
# video node
# {
#     video_url:"",
#     video_name:"",
# }

from selenium import webdriver
import requests
import time
import json
from random import randrange


