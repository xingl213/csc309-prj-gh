import gdown

# pgeocode.py
url = "https://drive.google.com/uc?id=1zl0-a12Rzj66E1kLqp4pZSzuzKfSeyAe"
output = "pgeocode.py"
gdown.download(url, output, quiet=False)

# cities
url = "https://drive.google.com/uc?id=1jhYpMLWZlWn6jR2ZoGjyLd1FVF4Rpklq"
output = "GeoLite2-City.mmdb"
gdown.download(url, output, quiet=False)

# country
url = "https://drive.google.com/uc?id=1Ue6mH4UgsVTw5Wld7VmO7s8JN_b1URbC"
output = "GeoLite2-Country.mmdb"
gdown.download(url, output, quiet=False)

# database
url = "https://drive.google.com/uc?export=download&id=1Y5IY0A7wzIu1S0UyRH0v9cpu8fzERHwn"
output = "db.sqlite3"
gdown.download(url, output, quiet=False)
