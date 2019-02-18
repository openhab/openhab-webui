#!/bin/sh
# Regenerates ESH Classic Icon Set

head -4 eclipse-smarthome-classic.list.json | tac | tac > eclipse-smarthome-classic.list.json.tmp

curl 'https://docs.openhab.org/addons/iconsets/classic/readme.html' | grep -i 'icons/.*\.png' | tac | tac | sed 's/^.*src="icons\/\(.*\)\.png".*$/    "\1",/g' >> eclipse-smarthome-classic.list.json.tmp

sed -i '$ s/.$//' eclipse-smarthome-classic.list.json.tmp

echo "  ]" >> eclipse-smarthome-classic.list.json.tmp

echo "}" >> eclipse-smarthome-classic.list.json.tmp

# Remove duplicates
awk '!seen[$0]++' eclipse-smarthome-classic.list.json.tmp > eclipse-smarthome-classic.list.json

rm -f eclipse-smarthome-classic.list.json.tmp

