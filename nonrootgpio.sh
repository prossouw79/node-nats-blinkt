#!/bin/bash
sudo groupadd gpio
sudo usermod -a -G gpio $USER
sudo grep gpio /etc/group
sudo chown root.gpio /dev/gpiomem
sudo chmod g+rw /dev/gpiomem
sudo reboot