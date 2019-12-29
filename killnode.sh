#!/usr/bin/env bash

#########################
# Kill Node Process
#########################

##### A
#NODE_PID=`netstat -aon | grep 8080 | grep -P '(?<=LISTENING).*' -o | grep -P '\\d*' -o`
#taskkill //pid $NODE_PID
#echo $NODE_PID >> ttttt

##### B
#alias killwebpack="taskkill //pid \`netstat -aon | grep 8080 | grep -P '(?<=LISTENING).*' -o | grep -P '\\d*' -o\` //f"
#killwebpack

##### C
taskkill //F //IM node.exe //T