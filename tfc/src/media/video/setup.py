import gdown

url = "https://drive.google.com/uc?export=download&id=1oiLsAAluLazTQS6IVZKagps1vgDV1AiB"
output = "trimmed.mp4"
gdown.download(url, output, quiet=False)