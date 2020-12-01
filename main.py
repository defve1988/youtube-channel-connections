# program starting control
from selenium import webdriver
import requests
import time
import json
from random import randrange
from channels import channel_list
from youtube import YoutuebTest

def parameter_input():
    tot_watch = 100
    watch_list_capcity = 50
    channel_init = 5
    update_vidoe = 5
    blocked = ["YouTube", "FUN Video"]
    while True:
        print("Test parameters:")
        print("1. Total videos: ", tot_watch)
        print("2. Watch list capcity: ", watch_list_capcity)
        print("3. Vidoes add to watch list each watch: ", update_vidoe)
        print("4. Vidoes add to watch list if start with a channel: ", channel_init)
        print("5. Channel blocked: ", blocked)
        update_para = input("Update parameters? (1/2/3/4/n)")

        if update_para == "1":
            tot_watch = int(input("Total videos ="))
        elif update_para == "2":
            watch_list_capcity = int(input("Watch list capcity ="))
        elif update_para == "3":
            update_vidoe = int(
                input("Vidoes add to watch list each watch ="))
        elif update_para == "4":
            channel_init = int(
                input("Vidoes add to watch list if start with a channel ="))
        else:
            break

    return tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked

def run_test(test_type, start_url, tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked):
    test = YoutuebTest(test_type, start_url)
    test.set_parameter(tot_watch, watch_list_capcity,
                        channel_init, update_vidoe, blocked)
    test.init_driver(webdriver.Chrome(chrome_options=options))
    test.run_test()
    test.driver.close()

if __name__ == "__main__":
    options = webdriver.ChromeOptions()
    # options.add_argument("headless")

    start_url = ""
    test_type = input("start with: 1. channel 2. video 3.test aLL? ")

    if test_type == "1":
        for i in channel_list.channel_index.keys():
            print(i, channel_list.channel_index[i])
        start_url = input("Select a number or copy url:")
        try:
            index = int(start_url)
            name = channel_list.channel_index[index]
            start_url = channel_list.channels[name]["url"]
            category = channel_list.channels[name]["category"]
            print(name, category, start_url)
        except:
            pass
    elif test_type == "2":
        start_url = input("start url (select number or copy url):")

    tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked = parameter_input()

    if test_type == "3":
        for i in channel_list.channel_index.keys():
            name = channel_list.channel_index[i]
            start_url = channel_list.channels[name]["url"]
            category = channel_list.channels[name]["category"]
            print("start run", name, category, start_url)
            run_test("1", start_url, tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked)
    else:
        run_test(test_type, start_url, tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked)
