from selenium import webdriver
import requests
import time
import json
from random import randrange


class YoutuebTest:
    def __init__(self, test_type, start_url):
        self.test_type = test_type
        self.start_url = start_url
        # self.channels_this = {"nodes": {}, "links": {}}
        # self.watched_url_this = []

    def init_driver(self, driver):
        self.watched = 0
        self.driver = driver
        self.channels, self.watched_url, self.watch_list_url = self.read_file()
        self.error_count = 0

        self.video_title_selector = '//*[@id="container"]/h1/yt-formatted-string'
        self.youtuber_selector = '//*[@id="text"]/a'
        self.subscriber_selector = '//*[@id="owner-sub-count"]'
        self.related_url_selector = '#dismissable > div > div.metadata.style-scope.ytd-compact-video-renderer > a'
        self.related_channel_selector = 'style-scope ytd-channel-name'

    def set_parameter(self, tot_watch, watch_list_capcity, channel_init, update_vidoe, blocked):
        self.tot_watch = tot_watch
        self.watch_list_capcity = watch_list_capcity
        self.channel_init = channel_init
        self.update_vidoe = update_vidoe
        self.blocked = blocked

    def read_file(self):
        try:
            with open("channel_graph.json", 'r', encoding='utf-8') as f:
                f = f.read()
                channels = json.loads(f)
        except Exception:
            channels = {"nodes": {}, "links": {}}
        try:
            with open("watched_url.json", 'r', encoding='utf-8') as f:
                f = f.read()
                watched_url = json.loads(f)
        except Exception:
            watched_url = []
        try:
            with open("watch_list_url.json", 'r', encoding='utf-8') as f:
                f = f.read()
                watch_list_url = json.loads(f)
        except Exception:
            watch_list_url = []
        return channels, watched_url, watch_list_url

    @staticmethod
    def convert_num(text, replace_text="subscribers"):
        text = text.replace(replace_text, "").replace(",", "").strip()
        if len(text) == 0:
            return 0
        if text[-1] == "K":
            return float(text[:-1])*1000
        if text[-1] == "M":
            return float(text[:-1])*1000000

    def restart(self):
        print('start...')
        self.error_count = 0
        self.prev_channel = ""

        if self.test_type == "1":
            url = self.start_url+'/videos'
            self.driver.get(url)
            try:
                videos = self.driver.find_elements_by_css_selector(
                    '#thumbnail')
                index = min(self.channel_init, len(videos))
                for i in videos[0:index]:
                    url = i.get_attribute('href')
                    if url not in self.watch_list_url and len(url) > 0:
                        self.watch_list_url.append(i.get_attribute('href'))

            except Exception as e:
                print(e)
                time.sleep(1)
        else:
            self.watch_list_url = [self.start_url]

    def watch_next(self):
        # select one video from watch list
        index = randrange(len(self.watch_list_url))
        self.driver.get(self.watch_list_url[index])
        self.watched_url.append(self.watch_list_url[index])
        # self.watched_url_this.append(self.watch_list_url[index])
        self.watch_list_url.pop(index)
        time.sleep(1)
        while True:
            if self.error_count > 20:
                test.restart()
                break
            try:
                title = self.driver.find_element_by_xpath(
                    self.video_title_selector)
                youtuber = self.driver.find_element_by_xpath(
                    self.youtuber_selector)
                subscriber = self.driver.find_element_by_xpath(
                    self.subscriber_selector)
                related_url = self.driver.find_elements_by_css_selector(
                    self.related_url_selector)
                related_channel = self.driver.find_elements_by_class_name(
                    self.related_channel_selector)

                print(self.watched, youtuber.text, title.text[0:25])

                # update node
                if youtuber.text not in self.channels["nodes"].keys():
                    if self.watched == 0:
                        isStart = True
                    else:
                        isStart = False
                    self.channels["nodes"][youtuber.text] = {
                        "id": youtuber.text,
                        "subscribers": self.convert_num(subscriber.text),
                        "url": youtuber.get_attribute('href'),
                        "watched": 1,
                        "isStart": isStart,
                        "watched_videos": [title.text]}
                    # self.channels_this["nodes"][youtuber.text] = {
                    #     "id": youtuber.text,
                    #     "subscribers": self.convert_num(subscriber.text),
                    #     "url": youtuber.get_attribute('href'),
                    #     "watched": 1,
                    #     "watched_videos": [title.text]}
                elif self.error_count == 0:
                    self.channels["nodes"][youtuber.text]["watched"] += 1
                    self.channels["nodes"][youtuber.text]["watched_videos"].append(
                        title.text)

                    # self.channels_this["nodes"][youtuber.text]["watched"] += 1
                    # self.channels_this["nodes"][youtuber.text]["watched_videos"].append(
                    #     title.text)
                    # print(self.error_count)

                # update links
                if not self.prev_channel == "":
                    link_id = self.prev_channel + '-' + youtuber.text
                    if link_id not in self.channels["links"].keys():
                        self.channels["links"][link_id] = {
                            "source": self.prev_channel,
                            "target": youtuber.text,
                            "value": 1,
                        }
                        # self.channels_this["links"][link_id] = {
                        #     "source": self.prev_channel,
                        #     "target": youtuber.text,
                        #     "value": 1
                        # }
                    else:
                        self.channels["links"][link_id]["value"] += 1
                        # self.channels_this["links"][link_id]["value"] += 1

                # update watch list
                index = min(self.update_vidoe, len(related_channel)-1)
                for i in range(index):
                    refer_channel = related_channel[i+1].text
                    refer_url = related_url[i].get_attribute('href')
                    if len(self.watch_list_url) < self.watch_list_capcity:
                        if len(refer_channel) > 0 and (not refer_channel in self.blocked) and (not 'list=' in refer_url):
                            if refer_url not in self.watched_url and refer_url not in self.watch_list_url:
                                self.watch_list_url.append(refer_url)

                self.prev_channel = youtuber.text
                self.watched += 1
                self.error_count = 0
                break
            except Exception as e:
                print(e)
                self.error_count += 1
                time.sleep(0.5)

    def save_data(self, this_run=False, this_run_name=""):
        res_channels = json.dumps(self.channels, sort_keys=True, indent=4,
                                  separators=(',', ':'), ensure_ascii=False)
        res_watched_url = json.dumps(self.watched_url, sort_keys=True, indent=4,
                                     separators=(',', ':'), ensure_ascii=False)
        with open("./data/channel_graph_"+str(self.watched//5)+".json", 'w', encoding='utf-8') as f:
            f.write(res_channels)
        with open("watched_url.json", 'w', encoding='utf-8') as f:
            f.write(res_watched_url)

        # if this_run:
        #     res_channels = json.dumps(self.channels_this, sort_keys=True, indent=4,
        #                               separators=(',', ':'), ensure_ascii=False)
        #     res_watched_url = json.dumps(self.watched_url_this, sort_keys=True, indent=4,
        #                                  separators=(',', ':'), ensure_ascii=False)
        #     with open("./runs/channel_graph_"+this_run_name + ".json", 'w', encoding='utf-8') as f:
        #         f.write(res_channels)
        #     with open("./runs/watched_url_"+this_run_name + ".json", 'w', encoding='utf-8') as f:
        #         f.write(res_watched_url)

        # res_watch_list_url = json.dumps(self.watch_list_url, sort_keys=True, indent=4,
        #                                 separators=(',', ':'), ensure_ascii=False)
        # with open("watch_list_url.json", 'w', encoding='utf-8') as f:
        #     f.write(res_watch_list_url)

    def run_test(self):
        self.restart()
        while True:
            if self.watched > self.tot_watch:
                break
            self.watch_next()
            if self.watched % 5 == 0:
                self.save_data()


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
