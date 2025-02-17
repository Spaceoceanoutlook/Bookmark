from datetime import datetime
import pytz
import time
import random

import requests
from bs4 import BeautifulSoup

# Устанавливаем местное время
local_tz = pytz.timezone("Asia/Yekaterinburg")


def get_local_time():
    return datetime.now(local_tz)


def get_title(url):
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36',
    ]
    headers = {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
    }

    response = requests.get(url, headers=headers)
    response.encoding = response.apparent_encoding
    time.sleep(random.uniform(1, 3))

    soup = BeautifulSoup(response.text, 'html.parser')
    time.sleep(random.uniform(1, 3))
    title = soup.title.string if soup.title else url
    return title

def link_search(t: str):
    words = t.split()
    for index, word in enumerate(words):
        if word.startswith('https'):
            words[index] = f"<a href='{word}' target='_blank' rel='noopener noreferrer'>{get_title(word)}</a>"
    return ' '.join(words)

