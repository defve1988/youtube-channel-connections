class ChannelList:
    def __init__(self):
        self.channels = {}
        self.category = []
        self.channel_index = {}

    def add_channels(self, channels, category):
        if category not in self.category:
            self.category.append(category)
        total = len(self.channels)
        for key in channels.keys():
            total += 1
            self.channels[key] = {
                "url": channels[key],
                "category": category}
            self.channel_index[total] = key


channel_list = ChannelList()
channels = {
    # 知识
    "妈咪说MommyTalk": "https://www.youtube.com/c/%E5%A6%88%E5%92%AA%E8%AF%B4MommyTalk",
    "李永乐老师": "https://www.youtube.com/channel/UCSs4A6HYKmHA2MG_0z-F0xw",
    "科学声音": "https://www.youtube.com/channel/UCUBhobCkTLhgfUNRAgHSYmw",
    "Yuan's Multiverse科技袁人": "https://www.youtube.com/channel/UCSgGqt-30oXBq0-n0K-t4Nw", }
channel_list.add_channels(channels, "知识")

channels = {
    # 电影
    "蔷仔说电影": "https://www.youtube.com/channel/UC_Udz5R0NCgLTWbmn-QiWGA",
    "看电影了没": "https://www.youtube.com/channel/UCZmyD8-UsaxaVL-Zx3KEQKw",
    "吐嚎影院": "https://www.youtube.com/channel/UCDiBqW5ew4VUIuGL06tJ_UQ",
    "科幻FANS": "https://www.youtube.com/channel/UCq2a8muf_TCGJt1AhBfU-7A", }
channel_list.add_channels(channels, "电影")

channels = {
    # 动漫
    "西瓜说柯南": "https://www.youtube.com/channel/UCMCLuCrtZ-L24Nqb2Cz6YkQ",
    "RushSong RS - ": "https://www.youtube.com/channel/UCvAFi3Brfyci4XH7V3pGcpA",
    "草泥泥影院官方频道": "https://www.youtube.com/channel/UCstG_4FppKsjQ8T6ygyA_1Q",
    "YGO": "https://www.youtube.com/channel/UCerJk0-d22M7MFy8opOuyjA",}
channel_list.add_channels(channels, "动漫")

channels = {
    # 游戏，电脑硬件
    "红酒汤姆一世": "https://www.youtube.com/channel/UCJT6M5j-HT-76ts0eTzZtJw",
    "方头人": "https://www.youtube.com/channel/UCCObFBf0GKZMRfBH3CCv_ug",
    "极客湾Geekerwan": "https://www.youtube.com/channel/UCeUJO1H3TEXu2syfAAPjYKQ", }
channel_list.add_channels(channels, "游戏，电脑硬件")

channels = {
    # 生活
    "李子柒 Liziqi": "https://www.youtube.com/channel/UCoC47do520os_4DBMEFGg4A",
    "马蹄厨房 Martin's Cuisine": "https://www.youtube.com/channel/UCRIGdUaQnVSIcIGP5w8N8SA",
    "NEVER TOO SMALL": "https://www.youtube.com/channel/UC_zQ777U6YTyatP3P1wi3xw",
    "老東北美食": "https://www.youtube.com/channel/UCyMScfdoCr6aeswJG7tdwmQ", }
channel_list.add_channels(channels, "生活")

channels = {
    # 生活
    "李子柒 Liziqi": "https://www.youtube.com/channel/UCoC47do520os_4DBMEFGg4A",
    "马蹄厨房 Martin's Cuisine": "https://www.youtube.com/channel/UCRIGdUaQnVSIcIGP5w8N8SA",
    "NEVER TOO SMALL": "https://www.youtube.com/channel/UC_zQ777U6YTyatP3P1wi3xw",
    "老東北美食": "https://www.youtube.com/channel/UCyMScfdoCr6aeswJG7tdwmQ", }
channel_list.add_channels(channels, "生活")

channels = {
    # 反共
    "王剑Wong Kim's Observation": "https://www.youtube.com/channel/UC8UCbiPrm2zN9nZHKdTevZA",
    "大紀元 — 新聞看點": "https://www.youtube.com/channel/UCPMqbkR35zZV1ysWGXJPW-w",
    "悉尼奶爸 Sydney Daddy": "https://www.youtube.com/channel/UCbKazqxVVIT0aIm4ZPR9t4w",
    "文昭談古論今 -Wen Zhao Official": "https://www.youtube.com/channel/UCtAIPjABiQD3qjlEl1T5VpA", }
channel_list.add_channels(channels, "反共")

channels = {
    # 官宣
    "GuanchaNews观察者网": "https://www.youtube.com/channel/UCJncdiH3BQUBgCroBmhsUhQ",
    "胡锡进Global Times Hu Xijin": "https://www.youtube.com/channel/UCVD-MGxD71IQUk9_hHq8MdA",
    "金灿荣频道": "https://www.youtube.com/channel/UCBXcmuXNObHgRzMHwXP2sLQ",
    "中国青年郑国成": "https://www.youtube.com/channel/UC5uh3zVGmvyQoks_LxBJ-5Q",}
channel_list.add_channels(channels, "官宣")

channels = {
    # 英文
    "The Coding Train": "https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw",
    "ColdFusion": "https://www.youtube.com/channel/UC4QZ_LsYcvcq7qOsOhpAX4A",
    "Two Minute Papers": "https://www.youtube.com/channel/UCbfYPyITQ-7l4upoX8nvctg",
    "Traversy Media": "https://www.youtube.com/channel/UC29ju8bIPH5as8OGnQzwJyA", }
channel_list.add_channels(channels, "英文")

