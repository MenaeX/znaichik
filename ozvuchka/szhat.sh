#!/bin/bash
# Сжатие озвучки в opus: приложение работает офлайн, вес критичен.
# Opus на 32 кбит/с даёт для речи качество лучше mp3 на 96.
# Голос один, речь простая — этого с запасом.
n=0
for f in *.wav; do
  out="${f%.wav}.opus"
  [ -f "$out" ] && continue
  ffmpeg -y -i "$f" -c:a libopus -b:a 32k -ar 24000 -ac 1 "$out" -loglevel error && n=$((n+1))
done
echo "сжато: $n"
