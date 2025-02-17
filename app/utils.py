from datetime import datetime
import pytz

# Устанавливаем местное время
local_tz = pytz.timezone("Asia/Yekaterinburg")


def get_local_time():
    return datetime.now(local_tz)


def link_search(t: str):
    words = t.split()
    for index, word in enumerate(words):
        if word.startswith('https://'):
            words[index] = f'<a href="{word}" target="_blank" rel="noopener noreferrer">{word}</a>'
    return ' '.join(words)